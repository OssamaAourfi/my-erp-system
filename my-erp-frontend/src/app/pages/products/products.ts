import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    FileUploadModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  http = inject(HttpClient);
  cd = inject(ChangeDetectorRef);
  messageService = inject(MessageService);
  productList: any[] = [];
  visible: boolean = false;


  productObj: any = {
    id: 0,
    reference: '',
    designation: '',
    prix_achat: 0,
    prix_vente: 0,
    tva: 20,
    stock_quantite: 0,
    image: '',
  };

  ngOnInit(): void {
    this.getProducts();

  }
  constructor(private route: ActivatedRoute) {}

  getProducts() {
    this.http.get('http://127.0.0.1:8000/api/produits').subscribe({
      next: (res: any) => {
        this.productList = res.member || res || [];
        this.cd.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  openNew() {
    this.productObj = {
      id: 0,
      reference: '',
      designation: '',
      prix_achat: 0,
      prix_vente: 0,
      tva: 20,
      stock_quantite: 0,
      image: '',
    };
    this.visible = true;
  }

  onEdit(product: any) {
    this.productObj = { ...product };
    this.visible = true;
  }

  onDelete(id: number) {
    if (confirm('Delete this product?')) {
      this.http.delete(`http://127.0.0.1:8000/api/produits/${id}`).subscribe({
        next: () => {
          alert('Deleted!');
          this.getProducts();
        },
      });
    }
  }

  saveProduct() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });

    if (this.productObj.id == 0) {
      this.http
        .post('http://127.0.0.1:8000/api/produits', this.productObj, { headers: headers })
        .subscribe({
          next: () => {
           this.messageService.add({
             severity: 'success',
             summary: 'Succès',
             detail: 'Opération enregistrée avec succès!',
           });
            this.getProducts();
            this.visible = false;
            this.cd.detectChanges();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Mochkil f enregistrement',
            });
          },
        });
    } else {
      this.http
        .put(`http://127.0.0.1:8000/api/produits/${this.productObj.id}`, this.productObj, {
          headers: headers,
        })
        .subscribe({
          next: () => {
             this.messageService.add({
               severity: 'success',
               summary: 'Succès',
               detail: 'Opération enregistrée avec succès!',
             });
            this.getProducts();
            this.visible = false;
            this.cd.detectChanges();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Mochkil f enregistrement',
            });
          },
        });
    }
  }
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post('http://127.0.0.1:8000/api/upload', formData).subscribe({
        next: (res: any) => {
          this.productObj.image = res.url;
        },
        error: (err) => {
          console.error('Upload failed', err);
          alert('Upload failed');
        },
      });
    }
  }
}
