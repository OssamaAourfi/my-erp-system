import { Routes } from '@angular/router';

import { Layout} from './pages/layout/layout';
import { Dashboard} from './pages/dashboard/dashboard';
import { Users} from './pages/users/users';
import { Products } from './pages/products/products';
import { Partenaires } from './pages/partenaires/partenaires';
import { Commandes } from './pages/commandes/commandes';
import { CommandeDetails } from './pages/commande-details/commande-details';
import { Login } from './pages/login/login';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
      { path: 'users', component: Users, canActivate: [authGuard] },
      { path: 'products', component: Products },
      { path: 'clients', component: Partenaires, data: { type: 'client' } },
      { path: 'fournisseurs', component: Partenaires, data: { type: 'fournisseur' } },
      { path: 'ventes', component: Commandes, data: { type: 'vente' } },
      { path: 'achats', component: Commandes, data: { type: 'achat' } },
      { path: 'devis', component: Commandes, data: { type: 'devis' } },
      { path: 'commandes', component: Commandes, canActivate: [authGuard] },
      { path: 'commandes/:id', component: CommandeDetails },
     
    ],
  },
];
