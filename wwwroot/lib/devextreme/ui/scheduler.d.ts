/**
* DevExtreme (ui/scheduler.d.ts)
* Version: 18.1.5
* Build date: Fri Jul 27 2018
*
* Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxScheduler(): JQuery;
    dxScheduler(options: "instance"): DevExpress.ui.dxScheduler;
    dxScheduler(options: string): any;
    dxScheduler(options: string, ...params: any[]): any;
    dxScheduler(options: DevExpress.ui.dxSchedulerOptions): JQuery;
}
}
export default DevExpress.ui.dxScheduler;
export type IOptions = DevExpress.ui.dxSchedulerOptions;