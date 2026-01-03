import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpriteListComponent } from './components/sprite-list/sprite-list.component';
import { SpriteDetailComponent } from './components/sprite-detail/sprite-detail.component';

const routes: Routes = [
  { path: '', component: SpriteListComponent },
  { path: 'sprites/:name', component: SpriteDetailComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
