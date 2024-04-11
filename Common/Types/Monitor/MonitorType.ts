import BadDataException from '../Exception/BadDataException';

enum MonitorType {
    Manual = 'Manual',
    Website = 'Website',
    API = 'API',
    Ping = 'Ping',
    Kubernetes = 'Kubernetes',
    IP = 'IP',
    IncomingRequest = 'Incoming Request',
    Port = 'Port',
    Server = 'Server',
    SSLCertificate = 'SSL Certificate',
}

export default MonitorType;

export interface MonitorTypeProps {
    monitorType: MonitorType;
    description: string;
    title: string;
}

export class MonitorTypeHelper {
    public static getAllMonitorTypeProps(): Array<MonitorTypeProps> {
        const monitorTypeProps: Array<MonitorTypeProps> = [
            {
                monitorType: MonitorType.API,
                title: 'API',
                description:
                    'This monitor type lets you monitor any API - GET, POST, PUT, DELETE or more.',
            },
            {
                monitorType: MonitorType.Manual,
                title: 'Manual',
                description:
                    'This monitor is a static monitor and will not actually monitor anything. It will however help you to integrate OneUptime with external monitoring tools and utilities.',
            },
            {
                monitorType: MonitorType.Website,
                title: 'Website',
                description:
                    'This monitor type lets you monitor landing pages like home page of your company / blog or more.',
            },
            {
                monitorType: MonitorType.Ping,
                title: 'Ping',
                description:
                    'This monitor types does the basic ping test of an endpoint.',
            },
            // {
            //     monitorType: MonitorType.Kubernetes,
            //     title: 'Kubernetes',
            //     description:
            //         'This monitor types lets you monitor Kubernetes clusters.',
            // },
            {
                monitorType: MonitorType.IP,
                title: 'IP',
                description:
                    'This monitor types lets you monitor any IPv4 or IPv6 addresses.',
            },
            {
                monitorType: MonitorType.IncomingRequest,
                title: 'Incoming Request',
                description:
                    'This monitor types lets you ping OneUptime from any external device or service with a custom payload.',
            },
            {
                monitorType: MonitorType.Port,
                title: 'Port',
                description:
                    'This monitor types lets you monitor any TCP or UDP port.',
            },
            {
                monitorType: MonitorType.Server,
                title: 'Server / VM',
                description:
                    'This monitor types lets you monitor any server, VM, or any machine.',
            },
            {
                monitorType: MonitorType.SSLCertificate,
                title: 'SSL Certificate',
                description:
                    'This monitor types lets you monitor SSL certificates of any domain.',
            },
        ];

        return monitorTypeProps;
    }

    public static getDescription(monitorType: MonitorType): string {
        const monitorTypeProps: Array<MonitorTypeProps> =
            this.getAllMonitorTypeProps().filter((item: MonitorTypeProps) => {
                return item.monitorType === monitorType;
            });

        if (!monitorTypeProps[0]) {
            throw new BadDataException(
                `${monitorType} does not have monitorType props`
            );
        }

        return monitorTypeProps[0].description;
    }

    public static getTitle(monitorType: MonitorType): string {
        const monitorTypeProps: Array<MonitorTypeProps> =
            this.getAllMonitorTypeProps().filter((item: MonitorTypeProps) => {
                return item.monitorType === monitorType;
            });

        if (!monitorTypeProps[0]) {
            throw new BadDataException(
                `${monitorType} does not have monitorType props`
            );
        }

        return monitorTypeProps[0].title;
    }

    public static isProbableMonitors(monitorType: MonitorType): boolean {
        const isProbeableMonitor: boolean =
            monitorType === MonitorType.API ||
            monitorType === MonitorType.Website ||
            monitorType === MonitorType.IP ||
            monitorType === MonitorType.Ping ||
            monitorType === MonitorType.Port ||
            monitorType === MonitorType.SSLCertificate;
        return isProbeableMonitor;
    }

    public static doesMonitorTypeHaveDocumentation(
        monitorType: MonitorType
    ): boolean {
        return (
            monitorType === MonitorType.IncomingRequest ||
            monitorType === MonitorType.Server
        );
    }

    public static doesMonitorTypeHaveInterval(
        monitorType: MonitorType
    ): boolean {
        return this.isProbableMonitors(monitorType);
    }

    public static doesMonitorTypeHaveCriteria(
        monitorType: MonitorType
    ): boolean {
        return monitorType !== MonitorType.Manual;
    }
}
