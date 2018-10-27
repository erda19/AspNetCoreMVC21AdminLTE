/**
* DevExtreme (viz/funnel.d.ts)
* Version: 18.1.5
* Build date: Fri Jul 27 2018
*
* Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxFunnel(): JQuery;
    dxFunnel(options: "instance"): DevExpress.viz.dxFunnel;
    dxFunnel(options: string): any;
    dxFunnel(options: string, ...params: any[]): any;
    dxFunnel(options: DevExpress.viz.funnel.dxFunnelOptions): JQuery;
}
}
export default DevExpress.viz.dxFunnel;
export type IOptions = DevExpress.viz.funnel.dxFunnelOptions;