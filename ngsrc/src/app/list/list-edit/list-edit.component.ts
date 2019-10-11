import { Component, OnInit } from '@angular/core';
import { ListService } from '../list.service';
import { Router } from '@angular/router';
import { RouteName } from 'src/app/route-name';

@Component({
  selector: 'app-list-edit',
  templateUrl: './list-edit.component.html',
  styleUrls: ['./list-edit.component.scss']
})
export class ListEditComponent implements OnInit {
  content: string;
  listIndex: number;
  constructor(private listService: ListService, private router: Router) { }

  ngOnInit(): void {
    this.content = this.listService.listContent;
    this.listIndex = this.listService.listIndex;
  }

  backToList() {
    this.router.navigate([RouteName.path_list]);
  }
}
