import { UmbUserGroupDetailDataSource } from '../../types.js';
import type { DataSourceResponse } from '@umbraco-cms/backoffice/repository';
import {
	UserGroupResponseModel,
	UserGroupResource,
	UpdateUserGroupRequestModel,
	CreateUserGroupRequestModel,
} from '@umbraco-cms/backoffice/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';

/**
 * A data source for the User that fetches data from the server
 * @export
 * @class UmbUserGroupServerDataSource
 * @implements {RepositoryDetailDataSource}
 */
export class UmbUserGroupServerDataSource implements UmbUserGroupDetailDataSource {
	#host: UmbControllerHost;

	/**
	 * Creates an instance of UmbUserGroupServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbUserGroupServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	//TODO should parentId be optional in the generic interface?
	async createScaffold(parentId: string | null) {
		const data: CreateUserGroupRequestModel = {
			name: '',
			icon: '',
			sections: [],
			languages: [],
			hasAccessToAllLanguages: false,
			permissions: [],
		};
		return { data };
	}

	read(id: string): Promise<DataSourceResponse<UserGroupResponseModel>> {
		if (!id) throw new Error('Id is missing');
		return tryExecuteAndNotify(this.#host, UserGroupResource.getUserGroupById({ id }));
	}
	create(data: CreateUserGroupRequestModel) {
		return tryExecuteAndNotify(this.#host, UserGroupResource.postUserGroup({ requestBody: data }));
	}
	update(id: string, data: UpdateUserGroupRequestModel) {
		if (!id) throw new Error('Id is missing');

		return tryExecuteAndNotify(
			this.#host,
			UserGroupResource.putUserGroupById({
				id,
				requestBody: data,
			}),
		);
	}
	delete(id: string): Promise<DataSourceResponse<undefined>> {
		if (!id) throw new Error('Id is missing');
		return tryExecuteAndNotify(this.#host, UserGroupResource.deleteUserGroupById({ id }));
	}
}
