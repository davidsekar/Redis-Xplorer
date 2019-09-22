import { ActionType } from "../enum";
import { ActionDetail } from './action-detail';

export class PostMessage {
    public action!: ActionType;
    public data!: ActionDetail;
}
