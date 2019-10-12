import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagingService } from '../messaging.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-server-info',
  templateUrl: './server-info.component.html',
  styleUrls: ['server-info.component.scss']
})
export class ServerInfoComponent implements OnInit, OnDestroy {
  title = 'No title';
  content = '';
  msgSubscription: Subscription;
  constructor(private messagingService: MessagingService) {

  }
  ngOnInit() {
    this.msgSubscription = this.messagingService.actionMessage$.subscribe((msg) => {
      if (msg && msg.data) {
        this.title = msg.data.connectionName;
        if (msg.data.itemData) {
          this.content = msg.data.itemData.replace(/\n/ig, '<br/>');
        }
      } else {
        this.content = '';
      }
    });
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
  }
}
