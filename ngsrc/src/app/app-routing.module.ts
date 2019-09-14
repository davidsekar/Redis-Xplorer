import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StringEditorComponent } from './string-editor/string-editor.component';


const routes: Routes = [
  {
    path: '',
    component: StringEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
