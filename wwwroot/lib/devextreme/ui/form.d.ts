/**
* DevExtreme (ui/form.d.ts)
* Version: 18.1.5
* Build date: Fri Jul 27 2018
*
* Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxForm(): JQuery;
    dxForm(options: "instance"): DevExpress.ui.dxForm;
    dxForm(options: string): any;
    dxForm(options: string, ...params: any[]): any;
    dxForm(options: DevExpress.ui.dxFormOptions): JQuery;
}
}
export default DevExpress.ui.dxForm;
export type IOptions = DevExpress.ui.dxFormOptions;