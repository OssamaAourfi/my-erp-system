import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './commandes.html',
  styleUrl: './commandes.scss',
})
export class Commandes implements OnInit {
  // Services
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  cd = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  // API Configuration
  apiUrl = 'http://127.0.0.1:8000/api';

  // Variables Principales
  commandesList: any[] = [];
  partenairesList: any[] = [];
  productsList: any[] = [];

  // Variables Etat
  visible: boolean = false;
  loading: boolean = false;
  isEditMode: boolean = false;
  currentType: string = 'vente';

  // Variables Pagination
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;

  // Variables Filtres
  filterReference: string = '';
  filterPartenaire: any = null;
  filterDateDu: Date | null = null;

  // Variables Impression
  selectedInvoice: any = null;


  displayQuickAdd: boolean = false;
  newClientName: string = '';


  commandeObj: any = {
    id: 0,
    reference: '',
    date: new Date(),
    partenaire: null,
    total: 0,
    statut: 'devis',
    ligneCommandes: [],
  };

  ngOnInit(): void {

    this.route.data.subscribe((data) => {
      this.currentType = data['type'] || 'vente';
      this.loadResources();
    });
  }

  loadResources() {
    const typePartenaire = this.currentType === 'vente' ? 'client' : 'fournisseur';

    this.http.get(`${this.apiUrl}/partenaires?type=${typePartenaire}`).subscribe({
      next: (res: any) => {
        this.partenairesList = res.member || res || [];

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading partenaires:', err),
    });

    this.http.get(`${this.apiUrl}/produits`).subscribe({
      next: (res: any) => {
        this.productsList = res.member || res || [];
        this.cd.detectChanges();
      },
    });
  }

  loadCommandes(event: any) {
    this.loading = true;


    const page = event.first / event.rows + 1;
    const itemsPerPage = event.rows;


    let url = `${this.apiUrl}/commandes?type=${this.currentType}&page=${page}&itemsPerPage=${itemsPerPage}`;

    console.log('🌍 URL Appelé avec Limit :', url);

    this.http.get(url).subscribe({
      next: (res: any) => {

        this.commandesList = res['hydra:member'] || res.member || [];
        this.totalRecords = res['hydra:totalItems'] || res.totalItems || 0;

        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }



  openNew() {
    this.isEditMode = false;
    this.commandeObj = {
      id: 0,
      reference: 'CMD-' + Math.floor(Math.random() * 10000),
      date: new Date(),
      partenaire: null,
      total: 0,
      statut: 'devis',
      ligneCommandes: [],
    };
    this.addLine();
    this.visible = true;
  }

  editCommande(com: any) {
    this.isEditMode = true;

    this.commandeObj = JSON.parse(JSON.stringify(com));

    if (this.commandeObj.date) this.commandeObj.date = new Date(this.commandeObj.date);
    this.visible = true;
  }



  addLine() {
    this.commandeObj.ligneCommandes.push({
      produit: null,
      quantite: 1,
      prix_unitaire: 0,
      total_line: 0,
    });
  }

  removeLine(index: number) {
    this.commandeObj.ligneCommandes.splice(index, 1);
    this.updateTotal();
  }

  onProductSelect(line: any) {
    if (line.produit) {

      line.prix_unitaire = line.produit.prix_vente || 0;
      this.calculateLineTotal(line);
    }
  }

  calculateLineTotal(line: any) {
    line.total_line = (line.quantite || 0) * (line.prix_unitaire || 0);
    this.updateTotal();
  }

  updateTotal() {
    this.commandeObj.total = this.commandeObj.ligneCommandes.reduce(
      (acc: number, item: any) => acc + item.total_line,
      0,
    );
  }


  saveCommande() {
    if (!this.commandeObj.partenaire) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Sélectionnez un client',
      });
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });


    const payload = {
      reference: this.commandeObj.reference,
      statut: this.commandeObj.statut || 'devis',
      total: Number(this.commandeObj.total),
      date:
        this.commandeObj.date instanceof Date
          ? this.commandeObj.date.toISOString()
          : new Date(this.commandeObj.date).toISOString(),

      type: this.currentType,

      partenaire: this.commandeObj.partenaire['@id']
        ? this.commandeObj.partenaire['@id']
        : `/api/partenaires/${this.commandeObj.partenaire.id}`,

      ligneCommandes: this.commandeObj.ligneCommandes.map((line: any) => {
        return {
          quantite: Number(line.quantite),
          prix_unitaire: Number(line.prix_unitaire),
          produit: line.produit['@id'] ? line.produit['@id'] : `/api/produits/${line.produit.id}`,
        };
      }),
    };

    console.log('Payload Envoyé:', payload);


    if (this.commandeObj.id === 0) {
      this.http.post(`${this.apiUrl}/commandes`, payload, { headers }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Commande créée',
          });
          this.visible = false;
          this.loadCommandes(null);
        },
        error: (err) => {
          console.error('Erreur API:', err);

          const msg = err.error['detail'] || err.error['hydra:description'] || 'Erreur inconnue';
          this.messageService.add({ severity: 'error', summary: 'Erreur 500', detail: msg });
        },
      });
    } else {
      this.http
        .put(`${this.apiUrl}/commandes/${this.commandeObj.id}`, payload, { headers })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Commande modifiée',
            });
            this.visible = false;
            this.loadCommandes(null);
          },
          error: (err) => {
            console.error('Erreur API:', err);
            const msg = err.error['detail'] || err.error['hydra:description'] || 'Erreur inconnue';
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
          },
        });
    }
  }

  saveQuickClient() {
    if (!this.newClientName) return;


    let typePartenaire = 'fournisseur';
    if (this.currentType === 'vente') {
      typePartenaire = 'prospect';
    }

    const newClientPayload = {
      nom_societe: this.newClientName,
      type: typePartenaire,
      email: null,
      telephone: '-',
      adresse: '-',
    };

    this.http.post(`${this.apiUrl}/partenaires`, newClientPayload).subscribe({
      next: (res: any) => {

        this.partenairesList = [...this.partenairesList, res];
        this.commandeObj.partenaire = res;
        this.displayQuickAdd = false;
        this.newClientName = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Prospect ajouté temporairement',
        });
      },
      error: (err) => console.error(err),
    });
  }


  deleteCommande(com: any) {
    this.confirmationService.confirm({
      message: 'Voulez-vous supprimer cette commande ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${this.apiUrl}/commandes/${com.id}`).subscribe(() => {
          this.loadCommandes(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Commande supprimée',
          });
        });
      },
    });
  }

  validerCommande(com: any) {

    const payload = {
      reference: com.reference,
      statut: 'validee',
      total: Number(com.total),
      type: com.type,


      date: com.date instanceof Date ? com.date.toISOString() : new Date(com.date).toISOString(),

      partenaire: com.partenaire['@id']
        ? com.partenaire['@id']
        : `/api/partenaires/${com.partenaire.id}`,


      ligneCommandes: com.ligneCommandes.map((line: any) => {
        return {
          quantite: Number(line.quantite),
          prix_unitaire: Number(line.prix_unitaire),
          produit: line.produit['@id'] ? line.produit['@id'] : `/api/produits/${line.produit.id}`,
        };
      }),
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    this.http.put(`${this.apiUrl}/commandes/${com.id}`, payload, { headers }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Commande validée !',
        });
        this.loadCommandes(null);
      },
      error: (err) => {
        console.error('Erreur Validation:', err);
        const msg = err.error['hydra:description'] || 'Erreur lors de la validation';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      },
    });
  }

  // === IMPRESSION ===

  printInvoice(com: any) {
    this.selectedInvoice = com;

    setTimeout(() => {
      window.print();

    }, 500);
  }

  getDateEcheance(date: any): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + 15);
    return d;
  }
  paiementDialog: boolean = false;
  selectedCommande: any = null;
  paiementObj = {
    montant: 0,
    mode: 'Espèce',
    reference: '',
    date: new Date().toISOString(),
  };


  openPaiement(commande: any) {
    console.log('=== BOUTON CLIQUÉ ===', commande);
    this.selectedCommande = commande;
    this.paiementObj = {
      montant: commande.total,
      mode: 'Espèce',
      reference: '',
      date: new Date().toISOString(),
    };
    this.paiementDialog = true;
    this.cd.detectChanges();
  }


  savePaiement() {
   
    const payload = {
      montant: String(this.paiementObj.montant),
      mode: this.paiementObj.mode,
      reference: this.paiementObj.reference,
      date: this.paiementObj.date,
      commande: `/api/commandes/${this.selectedCommande.id}`,
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    this.http.post(`${this.apiUrl}/paiements`, payload, { headers }).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Paiement ajouté !',
        });
        this.paiementDialog = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur paiement',
        });
      },
    });
  }
}
