import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-commande-details',
  imports: [CommonModule, ButtonModule, RouterLink],
  templateUrl: './commande-details.html',
  styleUrl: './commande-details.scss',
})
export class CommandeDetails implements OnInit {
  http = inject(HttpClient);
  route = inject(ActivatedRoute);
  cd = inject(ChangeDetectorRef);

  id: any;
  isLoading: boolean = true;
  commande: any = null;
  partenaireInfo: any = null;

  constructor() {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idRecupere = params.get('id');
      if (idRecupere && idRecupere !== 'undefined') {
        this.id = idRecupere;
        this.getDetails(this.id);
      }
    });
  }

  getDetails(id: any) {
    this.isLoading = true;
    const apiUrl = 'http://127.0.0.1:8000/api/commandes/' + id;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        this.commande = data;


        if (data.partenaire) {

          if (typeof data.partenaire === 'string') {
            const urlPartenaire = 'http://127.0.0.1:8000' + data.partenaire;
            this.http.get(urlPartenaire).subscribe((p: any) => {
              this.partenaireInfo = p;
              this.cd.detectChanges();
            });
          }
         
          else if (typeof data.partenaire === 'object') {
            this.partenaireInfo = data.partenaire;
          }
        }

        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  printInvoice() {
    window.print();
  }
}
