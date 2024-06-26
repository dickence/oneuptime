import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import PageComponentProps from '../../../../../PageComponentProps';
import GanttChart, {
    GanttChartProps,
} from 'CommonUI/src/Components/GanttChart/Index';
import Card from 'CommonUI/src/Components/Card/Card';
import ObjectID from 'Common/Types/ObjectID';
import Navigation from 'CommonUI/src/Utils/Navigation';
import ListResult from 'CommonUI/src/Utils/BaseDatabase/ListResult';
import Span from 'Model/AnalyticsModels/Span';
import AnalyticsModelAPI from 'CommonUI/src/Utils/AnalyticsModelAPI/AnalyticsModelAPI';
import { LIMIT_PER_PROJECT } from 'Common/Types/Database/LimitMax';
import SortOrder from 'Common/Types/BaseDatabase/SortOrder';
import API from 'CommonUI/src/Utils/API/API';
import PageLoader from 'CommonUI/src/Components/Loader/PageLoader';
import ErrorMessage from 'CommonUI/src/Components/ErrorMessage/ErrorMessage';
import SpanUtil from '../../../../../../Utils/SpanUtil';
import OneUptimeDate from 'Common/Types/Date';
import Color from 'Common/Types/Color';
import DashboardLogsViewer from '../../../../../../Components/LogsViewer/LogsViewer';
import Select from 'CommonUI/src/Utils/BaseDatabase/Select';
import TelemetryService from 'Model/Models/TelemetryService';
import ModelAPI from 'CommonUI/src/Utils/ModelAPI/ModelAPI';
import DashboardNavigation from '../../../../../../Utils/Navigation';
import { GanttChartBar } from 'CommonUI/src/Components/GanttChart/Bar/Index';
import { GanttChartRow } from 'CommonUI/src/Components/GanttChart/Row/Index';
import { PromiseVoidFunction } from 'Common/Types/FunctionTypes';
import { getRefreshButton } from 'CommonUI/src/Components/Card/CardButtons/Refresh';
import TelemetryServiceElement from '../../../../../../Components/TelemetryService/TelemetryServiceElement';

type BarTooltipFunctionProps = {
    span: Span;
    timelineStartTimeUnixNano: number;
    divisibilityFactorAndIntervalUnit: {
        divisibilityFactor: number;
        intervalUnit: string;
    };
};

type GetBarTooltipFunction = (data: BarTooltipFunctionProps) => ReactElement;

const TraceView: FunctionComponent<PageComponentProps> = (
    _props: PageComponentProps
): ReactElement => {
    const [telemetryServices, setTelemetryServices] = React.useState<
        TelemetryService[]
    >([]);

    const [selectedSpans, setSelectedSpans] = React.useState<string[]>([]);

    const spanIdFromUrl: ObjectID = Navigation.getLastParamAsObjectID(0);

    const [error, setError] = React.useState<string | null>(null);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [spans, setSpans] = React.useState<Span[]>([]);

    const [traceId, setTraceId] = React.useState<string | null>(null);

    const [ganttChart, setGanttChart] = React.useState<GanttChartProps | null>(
        null
    );

    const fetchItems: PromiseVoidFunction = async (): Promise<void> => {
        try {
            setIsLoading(true);

            // get trace with this id and then get all the parentSpanId with this traceid.

            const telemetryServices: ListResult<TelemetryService> =
                await ModelAPI.getList<TelemetryService>({
                    query: {
                        projectId: DashboardNavigation.getProjectId()!,
                    },
                    limit: LIMIT_PER_PROJECT,
                    skip: 0,
                    modelType: TelemetryService,
                    sort: {
                        name: SortOrder.Ascending,
                    },
                    select: {
                        name: true,
                        _id: true,
                        serviceColor: true,
                    },
                });

            setTelemetryServices(telemetryServices.data);

            const select: Select<Span> = {
                startTime: true,
                endTime: true,
                startTimeUnixNano: true,
                endTimeUnixNano: true,
                name: true,
                traceId: true,
                parentSpanId: true,
                spanId: true,
                kind: true,
                serviceId: true,
                durationUnixNano: true,
            };

            const spanFromUrl: Span | null =
                await AnalyticsModelAPI.getItem<Span>({
                    id: spanIdFromUrl,
                    modelType: Span,
                    select: select,
                });

            if (spanFromUrl === null) {
                setError('Span not found');
                setIsLoading(false);
                return;
            }

            // now get all the spans with the traceId

            const traceId: string = spanFromUrl.traceId!;

            setTraceId(traceId);

            const allSpans: ListResult<Span> =
                await AnalyticsModelAPI.getList<Span>({
                    modelType: Span,
                    select: select,
                    query: {
                        traceId: traceId,
                    },
                    sort: {
                        startTimeUnixNano: SortOrder.Ascending,
                    },
                    skip: 0,
                    limit: LIMIT_PER_PROJECT,
                });

            const spans: Span[] = [...allSpans.data];

            setSpans(spans);
        } catch (err) {
            setError(API.getFriendlyMessage(err));
        }

        setIsLoading(false);
    };

    const getBarTooltip: GetBarTooltipFunction = (
        data: BarTooltipFunctionProps
    ): ReactElement => {
        const {
            span,
            timelineStartTimeUnixNano,
            divisibilityFactorAndIntervalUnit,
        } = data;

        return (
            <div className="px-1 min-w-56 cursor-default">
                <div className="bar-tooltip-title text-sm text-gray-700 font-medium my-2">
                    {span.name}
                </div>
                <div className="bar-tooltip-description text-gray-600 text-xs space-y-1 my-2">
                    <div className="flex space-x-1">
                        <div>Span ID:</div> <div>{span.spanId?.toString()}</div>
                    </div>
                    <div className="flex space-x-1">
                        <div>Service:</div> <div>{span.spanId?.toString()}</div>
                    </div>
                    <div className="flex space-x-1">
                        <div>Seen at:</div>{' '}
                        <div>
                            {OneUptimeDate.getDateAsFormattedString(
                                span.startTime!
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <div>Start:</div>{' '}
                        <div>
                            {Math.round(
                                (span.startTimeUnixNano! -
                                    timelineStartTimeUnixNano) /
                                    divisibilityFactorAndIntervalUnit.divisibilityFactor
                            )}{' '}
                            {divisibilityFactorAndIntervalUnit.intervalUnit}
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <div>End:</div>{' '}
                        <div>
                            {Math.round(
                                (span.endTimeUnixNano! -
                                    timelineStartTimeUnixNano) /
                                    divisibilityFactorAndIntervalUnit.divisibilityFactor
                            )}{' '}
                            {divisibilityFactorAndIntervalUnit.intervalUnit}
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <div>Duration:</div>{' '}
                        <div>
                            {Math.round(
                                span.durationUnixNano! /
                                    divisibilityFactorAndIntervalUnit.divisibilityFactor
                            )}{' '}
                            {divisibilityFactorAndIntervalUnit.intervalUnit}
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <div>Span Kind:</div>{' '}
                        <div>
                            {SpanUtil.getSpanKindFriendlyName(span.kind!)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    type SpanToBarFunctionProps = {
        span: Span;
        timelineStartTimeUnixNano: number;
        divisibilityFactor: number;
        divisibilityFactorAndIntervalUnit: string;
    };

    type SpanToBarFunction = (data: SpanToBarFunctionProps) => GanttChartBar;

    const spanToBar: SpanToBarFunction = (
        data: SpanToBarFunctionProps
    ): GanttChartBar => {
        const {
            span,
            timelineStartTimeUnixNano,
            divisibilityFactor,
            divisibilityFactorAndIntervalUnit,
        } = data;

        const spanColor: {
            barColor: Color;
            titleColor: Color;
        } = SpanUtil.getGanttChartBarColor({
            span: span,
            telemetryServices: telemetryServices,
        });

        return {
            id: span.spanId!,
            title: span.name!,
            titleColor: spanColor.titleColor,
            barColor: spanColor.barColor,
            barTimelineStart:
                (span.startTimeUnixNano! - timelineStartTimeUnixNano) /
                divisibilityFactor,
            barTimelineEnd:
                (span.endTimeUnixNano! - timelineStartTimeUnixNano) /
                divisibilityFactor,
            rowId: span.spanId!,
            tooltip: getBarTooltip({
                span,
                timelineStartTimeUnixNano,
                divisibilityFactorAndIntervalUnit: {
                    divisibilityFactor: divisibilityFactor,
                    intervalUnit: divisibilityFactorAndIntervalUnit,
                },
            }),
        };
    };

    type GetBarsFunctionProps = {
        rootSpan: Span;
        allSpans: Span[];
        timelineStartTimeUnixNano: number;
        divisibilityFactor: number;
        divisibilityFactorAndIntervalUnit: string;
    };

    type GetRowsFunction = (data: GetBarsFunctionProps) => Array<GanttChartRow>;

    const getRows: GetRowsFunction = (
        data: GetBarsFunctionProps
    ): Array<GanttChartRow> => {
        const {
            rootSpan,
            allSpans,
            timelineStartTimeUnixNano,
            divisibilityFactor,
            divisibilityFactorAndIntervalUnit,
        } = data;

        if (!rootSpan) {
            return [];
        }

        const telemetryService: TelemetryService | undefined =
            telemetryServices.find((service: TelemetryService) => {
                return (
                    service._id?.toString() === rootSpan.serviceId?.toString()
                );
            });

        const rootRow: GanttChartRow = {
            rowInfo: {
                title: <div>{rootSpan.name!}</div>,
                description: telemetryService ? (
                    <TelemetryServiceElement
                        telemetryService={telemetryService}
                    />
                ) : (
                    <></>
                ),
                id: ObjectID.generate().toString(),
            },
            bars: [
                spanToBar({
                    span: rootSpan,
                    timelineStartTimeUnixNano,
                    divisibilityFactor,
                    divisibilityFactorAndIntervalUnit,
                }),
            ],
            childRows: [],
        };

        const currentSpan: Span = rootSpan;

        const currentSpanId: string | undefined = currentSpan.spanId;

        const childSpans: Array<Span> = allSpans.filter((span: Span) => {
            return span.parentSpanId?.toString() === currentSpanId?.toString();
        });

        for (const span of childSpans) {
            const childRows: Array<GanttChartRow> | null = getRows({
                rootSpan: span,
                allSpans,
                timelineStartTimeUnixNano,
                divisibilityFactor,
                divisibilityFactorAndIntervalUnit,
            });

            for (const row of childRows) {
                rootRow.childRows.push(row);
            }
        }

        return [rootRow];
    };

    React.useEffect(() => {
        fetchItems().catch((err: Error) => {
            setError(API.getFriendlyMessage(err));
        });
    }, []);

    type GetDivisibilityFactorFunction = (
        totalTimelineTimeInUnixNano: number
    ) => {
        divisibilityFactor: number;
        intervalUnit: string;
    };

    const getDivisibilityFactor: GetDivisibilityFactorFunction = (
        totalTimelineTimeInUnixNano: number
    ): {
        divisibilityFactor: number;
        intervalUnit: string;
    } => {
        let intervalUnit: string = 'ms';
        let divisibilityFactor: number = 1000; // default is in milliseconds

        if (totalTimelineTimeInUnixNano < 1000) {
            intervalUnit = 'ns';
            divisibilityFactor = 1; // this is in nanoseconds
        } else if (totalTimelineTimeInUnixNano < 1000000) {
            intervalUnit = 'μs';
            divisibilityFactor = 1000; // this is in microseconds
        } else if (totalTimelineTimeInUnixNano < 1000000000) {
            intervalUnit = 'ms';
            divisibilityFactor = 1000000; // this is in microseconds
        } else if (totalTimelineTimeInUnixNano < 1000000000000) {
            intervalUnit = 's';
            divisibilityFactor = 1000000000; // this is in seconds
        }

        return {
            divisibilityFactor: divisibilityFactor,
            intervalUnit: intervalUnit,
        };
    };

    React.useEffect(() => {
        // convert spans to gantt chart

        if (spans.length === 0) {
            return;
        }

        let timelineStartTimeUnixNano: number = spans[0]!.startTimeUnixNano!;

        let timelineEndTimeUnixNano: number =
            spans[spans.length - 1]!.endTimeUnixNano!;

        for (const span of spans) {
            if (span.startTimeUnixNano! < timelineStartTimeUnixNano) {
                timelineStartTimeUnixNano = span.startTimeUnixNano!;
            }

            if (span.endTimeUnixNano! > timelineEndTimeUnixNano) {
                timelineEndTimeUnixNano = span.endTimeUnixNano!;
            }
        }

        const startTimeline: number = 0;

        const divisibilityFactorAndIntervalUnit: {
            divisibilityFactor: number;
            intervalUnit: string;
        } = getDivisibilityFactor(
            timelineEndTimeUnixNano - timelineStartTimeUnixNano
        );

        const divisibilityFactor: number =
            divisibilityFactorAndIntervalUnit.divisibilityFactor;

        const endTimeline: number =
            (timelineEndTimeUnixNano - timelineStartTimeUnixNano) /
            divisibilityFactor; // divide by 1000 to convert from nanoseconds to ms

        const intervalTemp: number = Math.round(endTimeline / 100) * 10;

        const numberOfDigitsInIntervalTemp: number =
            intervalTemp.toString().length;

        const interval: number = Math.pow(10, numberOfDigitsInIntervalTemp);

        const ganttChart: GanttChartProps = {
            id: 'chart',
            rows: getRows({
                rootSpan: spans[0]!,
                allSpans: spans,
                timelineStartTimeUnixNano,
                divisibilityFactor,
                divisibilityFactorAndIntervalUnit:
                    divisibilityFactorAndIntervalUnit.intervalUnit,
            }),
            onBarSelectChange(barIds: Array<string>) {
                setSelectedSpans(barIds);
            },
            timeline: {
                start: startTimeline,
                end: Math.ceil(endTimeline / interval) * interval,
                interval: interval,
                intervalUnit: divisibilityFactorAndIntervalUnit.intervalUnit,
            },
        };

        setGanttChart(ganttChart);
    }, [spans]);

    if (isLoading) {
        return <PageLoader isVisible={true} />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <Fragment>
            <Card
                title={'Traces'}
                description={'Traces for the request operation.'}
                buttons={[
                    {
                        ...getRefreshButton(),
                        className: 'py-0 pr-0 pl-1 mt-1',
                        onClick: async () => {
                            await fetchItems();
                        },
                        disabled: isLoading,
                    },
                ]}
            >
                <div className="overflow-x-auto">
                    {ganttChart ? (
                        <GanttChart chart={ganttChart} />
                    ) : (
                        <ErrorMessage error={'No spans found'} />
                    )}
                </div>
            </Card>

            {traceId && (
                <DashboardLogsViewer
                    id={'traces-logs-viewer'}
                    noLogsMessage="No logs found for this trace."
                    traceIds={[traceId]}
                    spanIds={selectedSpans}
                    enableRealtime={false}
                />
            )}
        </Fragment>
    );
};

export default TraceView;
