import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MenuModule,
    AvatarModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    FormsModule,
    OverlayPanelModule,
    BadgeModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  items: MenuItem[] | undefined;
  visibleProfile: boolean = false;
  visiblePasswordDialog: boolean = false;
  currentUser: any = { nom: '', email: '', role: '' };
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  http = inject(HttpClient);

  alerts: any[] = [];
  alertCount: number = 0;

  public authService = inject(AuthService);

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkStockAlerts();
    const user = this.authService.getUserFromToken();
    if (user) {
      this.currentUser = {
        nom: user.nom,
        prenom: '',
        email: user.email,
        role: user.roles.includes('ROLE_ADMIN') ? 'Administrateur' : 'Utilisateur',
      };
    }
    this.items = [
      {
        label: 'Mon Compte',
        items: [
          {
            label: 'Profil',
            icon: 'pi pi-user',
            command: () => {
              this.visibleProfile = true;
            },
          },
          {
            label: 'Déconnexion',
            icon: 'pi pi-power-off',
            command: () => {
              this.logout();
            },
          },
        ],
      },
    ];
  }

  checkStockAlerts() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/custom/alerts/stock').subscribe({
      next: (res) => {
        this.alerts = res;
        this.alertCount = res.length;
      },
      error: (err) => console.error(err),
    });
  }

  getStockSeverity(stock: number): string {
    if (stock <= 0) return 'danger';
    return 'warning';
  }

  openPasswordDialog() {
    this.visibleProfile = false;
    this.visiblePasswordDialog = true;
  }

  submitPasswordChange() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('La confirmation du mot de passe ne correspond pas !');
      return;
    }

    this.authService
      .changePassword({
        currentPassword: this.passwordData.currentPassword,
        newPassword: this.passwordData.newPassword,
      })
      .subscribe({
        next: (res: any) => {
          alert('Succès : ' + res.message);
          this.visiblePasswordDialog = false;
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        },
        error: (err) => {
          if (err.status === 400) {
            alert('Erreur : ' + err.error.message);
          } else {
            alert('Erreur technique, veuillez réessayer.');
          }
        },
      });
  }
  navigateToProduct(item: any) {

    this.router.navigate(['/products'], { queryParams: { search: item.reference } });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
