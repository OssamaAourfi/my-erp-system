import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  http = inject(HttpClient);
  cd = inject(ChangeDetectorRef);
  authService = inject(AuthService);
  userService = inject(UserService);


  totalUsers: number = 0;
  totalProducts: number = 0;
  totalStockValue: number = 0;
  totalVentes: number = 0;
  totalAchats: number = 0;
  netProfit: number = 0;


  chartData: any;
  chartOptions: any;
  monthlyVentes: number[] = new Array(12).fill(0);
  monthlyAchats: number[] = new Array(12).fill(0);

  ngOnInit(): void {
    this.initChartOptions();
    this.getDashboardStats();
    this.getFinancialStats();
  }

  onLogout() {
    this.authService.logout();
  }

  getDashboardStats() {

    this.http.get<any>('http://127.0.0.1:8000/api/users?pagination=false').subscribe({
      next: (res) => {
        const users = Array.isArray(res) ? res : res['hydra:member'] || res.member || [];
        this.totalUsers = users.length;
        this.cd.detectChanges();
      },
      error: (err) => console.error('❌ Erreur Users:', err),
    });


    this.http.get<any>('http://127.0.0.1:8000/api/produits?pagination=false').subscribe((res) => {
      const products = Array.isArray(res) ? res : res['hydra:member'] || res.member || [];
      this.totalProducts = products.length;


      this.totalStockValue = products.reduce((acc: number, item: any) => {

        return acc + item.prix_vente * item.stock_quantite;
      }, 0);

      this.cd.detectChanges();
    });
  }

  getFinancialStats() {

    this.http
      .get<any>('http://127.0.0.1:8000/api/commandes?type=vente&pagination=false')
      .subscribe((res) => {
        const ventes = Array.isArray(res) ? res : res['hydra:member'] || res.member || [];
        this.totalVentes = ventes.reduce((sum: number, v: any) => sum + v.total, 0);

        this.processMonthlyData(ventes, this.monthlyVentes);
        this.calculateNetProfit();
        this.updateChart();
      });

    
    this.http
      .get<any>('http://127.0.0.1:8000/api/commandes?type=achat&pagination=false')
      .subscribe((res) => {
        const achats = Array.isArray(res) ? res : res['hydra:member'] || res.member || [];
        this.totalAchats = achats.reduce((sum: number, a: any) => sum + a.total, 0);

        this.processMonthlyData(achats, this.monthlyAchats);
        this.calculateNetProfit();
        this.updateChart();
      });
  }


  calculateNetProfit() {
    this.netProfit = this.totalVentes - this.totalAchats;
    this.cd.detectChanges();
  }

  processMonthlyData(transactions: any[], targetArray: number[]) {
    targetArray.fill(0);
    transactions.forEach((t: any) => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth();
      const amount = t.total || 0;
      targetArray[monthIndex] += amount;
    });
  }


  updateChart() {
    this.chartData = {
      labels: [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ],
      datasets: [
        {
          label: 'Ventes',
          data: this.monthlyVentes,

          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: '#6366f1',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#6366f1',
          pointRadius: 4,
        },
        {
          label: 'Achats',
          data: this.monthlyAchats,

          fill: true,
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          borderColor: '#f97316',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#f97316',
          pointRadius: 4,
        },
      ],
    };
    this.cd.detectChanges();
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            usePointStyle: true,
            font: { weight: 'bold' },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { display: false, drawBorder: false },
        },
        y: {
          ticks: { color: textColor },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
            borderDash: [5, 5],
          },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    };
  }
}
