import ObjectID from 'Common/Types/ObjectID';
import ScheduledMaintenanceState from 'Model/Models/ScheduledMaintenanceState';
import CreateBy from '../../../Types/Database/CreateBy';
import { Black, Yellow500 } from 'Common/Types/BrandColors';

export default class ScheduledMaintenanceStateTestService {
    public static generateScheduledState(
        projectId: ObjectID
    ): CreateBy<ScheduledMaintenanceState> {
        const scheduledState: ScheduledMaintenanceState =
            new ScheduledMaintenanceState();

        // required fields
        scheduledState.name = 'Scheduled';
        scheduledState.description =
            'When an event is scheduled, it belongs to this state';
        scheduledState.color = Black;
        scheduledState.isScheduledState = true;
        scheduledState.projectId = projectId;
        scheduledState.order = 1;
        scheduledState.slug = scheduledState.name;

        return {
            data: scheduledState,
            props: { isRoot: true },
        };
    }

    public static generateOngoingState(
        projectId: ObjectID
    ): CreateBy<ScheduledMaintenanceState> {
        const ongoingState: ScheduledMaintenanceState =
            new ScheduledMaintenanceState();

        // required fields
        ongoingState.name = 'Ongoing';
        ongoingState.description =
            'When an event is ongoing, it belongs to this state.';
        ongoingState.color = Yellow500;
        ongoingState.isOngoingState = true;
        ongoingState.projectId = projectId;
        ongoingState.order = 2;
        ongoingState.slug = ongoingState.name;

        return {
            data: ongoingState,
            props: { isRoot: true },
        };
    }
}
