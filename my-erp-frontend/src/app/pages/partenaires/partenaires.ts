import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-partenaires',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    SelectButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './partenaires.html',
  styleUrl: './partenaires.scss',
})
export class Partenaires implements OnInit {
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  cd = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  partenaireList: any[] = [];
  visible: boolean = false;
  currentType: string = '';


  partenaireObj: any = {
    id: 0,
    nom_societe: '',
    email: '',
    telephone: '',
    ice: '',
    adresse: '',
    type: '',
  };

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.currentType = data['type'];
      this.getPartenaires();
    });
  }

  getPartenaires() {
    this.http.get(`http://127.0.0.1:8000/api/partenaires?type=${this.currentType}`).subscribe({
      next: (res: any) => {
        this.partenaireList = res.member || res || [];
        this.cd.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  openNew() {
    this.partenaireObj = {
      id: 0,
      nom_societe: '',
      email: '',
      telephone: '',
      ice: '',
      adresse: '',
      type: this.currentType,
    };
    this.visible = true;
  }

  onEdit(item: any) {
    this.partenaireObj = { ...item };
    this.visible = true;
  }

  onDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer ce partenaire ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.http.delete(`http://127.0.0.1:8000/api/partenaires/${id}`).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Partenaire supprimé',
            });
            this.getPartenaires();
          },

          error: (err) => {
            console.error(err);
            
            if (err.status === 500) {
              this.messageService.add({
                severity: 'error',
                summary: 'Impossible de supprimer',
                detail:
                  'Ce partenaire contient des commandes ou des factures. Vous ne pouvez pas le supprimer.',
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur serveur inconnue',
              });
            }
          },
        });
      },
    });
  }

  savePartenaire() {
    this.partenaireObj.type = this.currentType;

    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    if (this.partenaireObj.id === 0) {
      const { id, ...payload } = this.partenaireObj;

      this.http
        .post('http://127.0.0.1:8000/api/partenaires', payload, { headers: headers })
        .subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Partenaire validée !',
            });
            this.getPartenaires();
            this.visible = false;
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error['hydra:description'] || 'Vérifiez les champs';
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: msg,
            });
          },
        });
    } else {
      this.http
        .put(`http://127.0.0.1:8000/api/partenaires/${this.partenaireObj.id}`, this.partenaireObj, {
          headers: headers,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Partenaire Modifier !',
            });
            this.getPartenaires();
            this.visible = false;
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error['hydra:description'] || 'Vérifiez les champs';
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: msg,
            });
          },
        });
    }
  }
}
