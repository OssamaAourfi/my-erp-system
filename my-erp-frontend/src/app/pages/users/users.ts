import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, DropdownModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  http = inject(HttpClient);
  cd = inject(ChangeDetectorRef);
  userList: any[] = [];
  visible: boolean = false;
  rolesList = [
    { label: 'Vendeur (Utilisateur)', value: 'ROLE_USER' },
    { label: 'Administrateur', value: 'ROLE_ADMIN' },
  ];
  selectedRole: string = 'ROLE_USER';
  userObj: any = {
    id: 0,
    email: '',
    password: '',
    nom: '',
    prenom: '',
    roles: ['ROLE_USER'],
  };

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/users').subscribe({
      next: (res) => {
        this.userList = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement users:', err);
      },
    });
  }

  openNew() {
    this.userObj = {
      id: 0,
      email: '',
      password: '',
      nom: '',
      prenom: '',
      roles: [],
    };
    this.selectedRole = 'ROLE_USER';
    this.visible = true;
  }

  onEdit(user: any) {
    this.userObj = { ...user };
    this.userObj.password = '';
    if (this.userObj.roles.includes('ROLE_ADMIN')) {
      this.selectedRole = 'ROLE_ADMIN';
    } else {
      this.selectedRole = 'ROLE_USER';
    }
    this.visible = true;
  }

  saveUser() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.userObj.roles = [this.selectedRole];
    if (this.userObj.id == 0) {
      // CREATE
      this.http
        .post('http://127.0.0.1:8000/api/users', this.userObj, { headers: headers })
        .subscribe({
          next: (res: any) => {
            alert('✅ User Created');
            this.getUsers();
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            alert('Error Creating User');
          },
        });
    } else {
      // UPDATE
      this.http
        .put(`http://127.0.0.1:8000/api/users/${this.userObj.id}`, this.userObj, {
          headers: headers,
        })
        .subscribe({
          next: (res: any) => {
            alert('✅ User Updated');
            this.getUsers();
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            alert('Error Updating User');
          },
        });
    }
  }

  onDelete(id: number) {
    const isConfirm = confirm('Are you sure you want to delete this user?');
    if (isConfirm) {
      this.http.delete(`http://127.0.0.1:8000/api/users/${id}`).subscribe({
        next: (res: any) => {
          alert('🗑️ User Deleted');
          this.getUsers();
        },
        error: (err) => {
          alert('Error Deleting');
        },
      });
    }
  }
}
