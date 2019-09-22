import { Component, OnInit } from '@angular/core';
import { MessagingService } from '../messaging.service';

@Component({
  selector: 'app-server-info',
  templateUrl: './server-info.component.html',
  styleUrls: ['server-info.component.scss']
})
export class ServerInfoComponent implements OnInit {
  title = 'No title';
  content = '';
  constructor(private messagingService: MessagingService) {

  }
  ngOnInit(): void {
    this.messagingService.actionMessage$.subscribe((msg) => {
      if (msg && msg.data) {
        this.title = msg.data.itemName;
        this.content = msg.data.itemData.replace(/\n/ig, '<br/>');
      } else {
        this.content = '';
      }
    });
  }
}
