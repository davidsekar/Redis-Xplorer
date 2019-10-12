import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessagingService } from '../messaging.service';
import { ListService } from './list.service';
import { Constants } from 'src/external-imports';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  title = 'No title';
  msgSubscription: Subscription;
  content: string[] = [];
  listCount = 0;
  pageNo = 0;
  itemsPerPage: number = Constants.DefaultRedisListItemsLimit;
  constructor(
    private messagingService: MessagingService,
    private listService: ListService) { }

  ngOnInit(): void {
    this.msgSubscription = this.messagingService.actionMessage$.subscribe((msg) => {
      if (msg && msg.data) {
        this.title = msg.data.connectionName;
        this.listCount = msg.data.itemData.count;
        this.content = msg.data.itemData.items;
      } else {
        this.content = [];
        this.listCount = 0;
        this.pageNo = 0;
      }
    });
  }

  onEditClick(value: string, index: number) {
    this.listService.content = value;
    this.listService.index = index + (this.pageNo * this.itemsPerPage);
    this.listService.connectionName = this.title;
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
  }
}
