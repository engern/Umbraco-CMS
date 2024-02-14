import type { UmbDataTypeTreeItemModel } from './types.js';
import { UmbTreeServerDataSourceBase } from '@umbraco-cms/backoffice/tree';
import type { DataTypeTreeItemResponseModel } from '@umbraco-cms/backoffice/external/backend-api';
import { DataTypeResource } from '@umbraco-cms/backoffice/external/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

/**
 * A data source for a data type tree that fetches data from the server
 * @export
 * @class UmbDataTypeTreeServerDataSource
 * @implements {DocumentTreeDataSource}
 */
export class UmbDataTypeTreeServerDataSource extends UmbTreeServerDataSourceBase<
	DataTypeTreeItemResponseModel,
	UmbDataTypeTreeItemModel
> {
	/**
	 * Creates an instance of UmbDataTypeTreeServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbDataTypeTreeServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		super(host, {
			getRootItems,
			getChildrenOf,
			mapper,
		});
	}
}

// eslint-disable-next-line local-rules/no-direct-api-import
const getRootItems = () => DataTypeResource.getTreeDataTypeRoot({});

const getChildrenOf = (parentUnique: string | null) => {
	if (parentUnique === null) {
		return getRootItems();
	} else {
		// eslint-disable-next-line local-rules/no-direct-api-import
		return DataTypeResource.getTreeDataTypeChildren({
			parentId: parentUnique,
		});
	}
};

const mapper = (item: DataTypeTreeItemResponseModel): UmbDataTypeTreeItemModel => {
	return {
		unique: item.id,
		parentUnique: item.parent?.id || null,
		name: item.name,
		entityType: item.isFolder ? 'data-type-folder' : 'data-type',
		isFolder: item.isFolder,
		hasChildren: item.hasChildren,
	};
};
