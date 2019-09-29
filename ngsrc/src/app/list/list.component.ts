import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { MessagingService } from '../messaging.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  title = 'No title';
  msgSubscription: Subscription;
  content: string[] = [];
  constructor(private messagingService: MessagingService) { }

  ngOnInit(): void {
    this.msgSubscription = this.messagingService.actionMessage$.subscribe((msg) => {
      if (msg && msg.data) {
        this.title = msg.data.itemName;
        this.content = msg.data.itemData;
      } else {
        this.content = [];
      }
    });
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
  }
}
