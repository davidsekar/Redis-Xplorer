import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PostMessage } from 'src/external-imports';

@Injectable()
export class MessagingService {
  constructor(private globalService: GlobalService) { }

  private actionSubject = new BehaviorSubject<PostMessage>(undefined);
  receivedPostMessage$ = fromEvent(this.globalService.nativeWindow, 'message');
  actionMessage$ = this.actionSubject.asObservable();

  sendPostMessage(request) {
    this.globalService.vscode.postMessage<string>(request);
  }

  sendActionMessage(request) {
    this.actionSubject.next(request);
  }
}
