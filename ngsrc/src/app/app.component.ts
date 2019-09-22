import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MessagingService } from './messaging.service';
import { Subscription } from 'rxjs';
import { RouteName } from './route-name';
import { PostMessage, ActionType } from 'src/external-imports';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Redis Editor';
  private pmSubscriptin: Subscription;
  constructor(private messagingService: MessagingService, private router: Router) {
    this.messagingService.sendPostMessage({ data: 'Loaded', name: 'alert' });
  }

  ngOnInit(): void {
    this.pmSubscriptin = this.messagingService.receivedPostMessage$.subscribe((evt) => this.handleNavigation(evt));
  }

  ngOnDestroy(): void {
    this.pmSubscriptin.unsubscribe();
  }

  private handleNavigation(event: any) {
    const message: PostMessage = event.data;
    if (!message) { return; }
    this.messagingService.sendActionMessage(message);
    this.title = message.action.toString();
    let actionRoute = '';
    switch (message.action) {
      case ActionType.ViewServerInfo:
        actionRoute = RouteName.path_serverinfo;
        break;
      case ActionType.DisplayText:
        actionRoute = RouteName.path_string;
        break;
    }
    this.router.navigate([actionRoute], {});
  }
}
