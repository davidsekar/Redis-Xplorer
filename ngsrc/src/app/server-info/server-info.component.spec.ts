import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServerInfoComponent } from './server-info.component';
import { MessagingService } from '../messaging.service';
import { GlobalService } from '../global.service';
import { ActionDetail, PostMessage, ActionType } from '../../external-imports';

describe('ServerInfoComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        ServerInfoComponent
      ],
      providers: [
        GlobalService,
        MessagingService
      ]
    }).compileComponents();
  }));

  it('should create the app - ServerInfoComponent', () => {
    const fixture = TestBed.createComponent(ServerInfoComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  fit('should create the app - ServerInfoComponent', () => {
    const fixture = TestBed.createComponent(ServerInfoComponent);
    const app = fixture.debugElement.componentInstance;
    const msgService: MessagingService = TestBed.get(MessagingService);

    const actionDetail = new ActionDetail();
    actionDetail.itemName = 'Staging';
    actionDetail.itemData = 'Test server\n Info';

    const message = new PostMessage();
    message.action = ActionType.ViewServerInfo;
    message.data = actionDetail;

    msgService.sendActionMessage(message);
    fixture.detectChanges();
  });
});
