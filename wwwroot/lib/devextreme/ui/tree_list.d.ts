/**
* DevExtreme (ui/tree_list.d.ts)
* Version: 18.1.5
* Build date: Fri Jul 27 2018
*
* Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxTreeList(): JQuery;
    dxTreeList(options: "instance"): DevExpress.ui.dxTreeList;
    dxTreeList(options: string): any;
    dxTreeList(options: string, ...params: any[]): any;
    dxTreeList(options: DevExpress.ui.dxTreeListOptions): JQuery;
}
}
export default DevExpress.ui.dxTreeList;
export type IOptions = DevExpress.ui.dxTreeListOptions;