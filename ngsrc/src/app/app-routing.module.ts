import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StringEditorComponent } from './string-editor/string-editor.component';
import { HomeComponent } from './home/home.component';
import { ServerInfoComponent } from './server-info/server-info.component';
import { RouteName } from './route-name';
import { ListComponent, ListEditComponent } from './list';


const routes: Routes = [{
  path: '',
  component: HomeComponent
}, {
  path: RouteName.path_string,
  component: StringEditorComponent
}, {
  path: RouteName.path_serverinfo,
  component: ServerInfoComponent
}, {
  path: RouteName.path_list,
  component: ListComponent
}, {
  path: RouteName.path_list_edit,
  component: ListEditComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }