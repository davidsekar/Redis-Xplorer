import { Component, OnInit } from '@angular/core';
import { MessagingService } from '../messaging.service';

@Component({
  selector: 'app-string-editor',
  templateUrl: './string-editor.component.html'
})
export class StringEditorComponent implements OnInit {
  title = 'Redis Editor - String';
  content = '';

  constructor(private messagingService: MessagingService) {
  }
  ngOnInit(): void {
    this.messagingService.actionMessage$.subscribe((msg) => {
      if (msg && msg.data) {
        // this.content = msg.data;
      } else {
        this.content = '';
      }
    });
  }

}