import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);

  credentials = {
    email: '',
    password: '',
  };

  errorMessage: string = '';

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {

        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
       
        this.errorMessage = 'Email ou Mot de passe incorrect';
      },
    });
  }
}
