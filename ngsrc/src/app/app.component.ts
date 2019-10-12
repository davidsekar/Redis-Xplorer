import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MessagingService } from './messaging.service';
import { Subscription } from 'rxjs';
import { RouteName } from './route-name';
import { PostMessage, ActionType } from 'src/external-imports';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Redis Editor';
  private pmSubscriptin: Subscription;
  constructor(private messagingService: MessagingService, private router: Router) {
    this.messagingService.sendMessagToExtension({ data: 'Loaded', name: 'alert' });
  }

  ngOnInit(): void {
    this.pmSubscriptin = this.messagingService.receivedPostMessage$.subscribe((evt) => this.handleNavigationMessageFromParent(evt));
  }

  ngOnDestroy(): void {
    this.pmSubscriptin.unsubscribe();
  }

  /**
   * Handles redirection to proper route based on the redis datatype
   * @param event post message event from the parent extension
   */
  private handleNavigationMessageFromParent(event: any) {
    const message: PostMessage = event.data;
    if (!message || !message.action) { return; }

    this.messagingService.sendActionDetail(message);
    this.title = message.action.toString();
    let actionRoute = '';
    switch (message.action) {
      case ActionType.ViewServerInfo:
        actionRoute = RouteName.path_serverinfo;
        break;
      case ActionType.ViewList:
        actionRoute = RouteName.path_list;
        break;
      case ActionType.DisplayText:
        actionRoute = RouteName.path_string;
        break;
    }
    this.router.navigate([actionRoute], {});
  }

  private sendMessageToParent() {

  }
}
