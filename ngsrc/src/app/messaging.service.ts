import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PostMessage } from 'src/external-imports';

@Injectable()
export class MessagingService {
  constructor(private globalService: GlobalService) { }

  private actionSubject = new BehaviorSubject<PostMessage>(undefined);

  actionMessage$ = this.actionSubject.asObservable(); // Observable for child components
  receivedPostMessage$ = fromEvent(this.globalService.nativeWindow, 'message');

  /**
   * Sends request object to parent extension through post-message
   * @param request request object
   */
  sendMessagToExtension(request) {
    this.globalService.vscode.postMessage<string>(request);
  }

  /**
   * Sends action detail to subscribing child components
   * @param request request object
   */
  sendActionDetail(request) {
    this.actionSubject.next(request);
  }
}
