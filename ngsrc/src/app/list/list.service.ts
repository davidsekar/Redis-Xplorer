import { Injectable } from '@angular/core';

@Injectable()
export class ListService implements ICommunicationService {
  index: number;
  content: string;
  connectionName: string;
}
