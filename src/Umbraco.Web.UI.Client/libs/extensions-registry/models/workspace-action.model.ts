import type { InterfaceColor, InterfaceLook } from '@umbraco-ui/uui-base/lib/types/index';
import type { ManifestElement, ClassConstructor } from '@umbraco-cms/backoffice/extensions-api';
import { UmbWorkspaceAction } from '@umbraco-cms/backoffice/workspace';

export interface ManifestWorkspaceAction extends ManifestElement {
	type: 'workspaceAction';
	meta: MetaWorkspaceAction;
	conditions: ConditionsWorkspaceAction;
}

export interface MetaWorkspaceAction {
	label?: string; //TODO: Use or implement additional label-key
	look?: InterfaceLook;
	color?: InterfaceColor;
	api: ClassConstructor<UmbWorkspaceAction>;
}

export interface ConditionsWorkspaceAction {
	workspaces: Array<string>;
}
