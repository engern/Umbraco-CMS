import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';

/**
 * @export
 * @class UmbUserGroupCollectionServerDataSource
 * @implements {RepositoryDetailDataSource}
 */
export class UmbDocumentPermissionServerDataSource {
	#host: UmbControllerHost;

	/**
	 * Creates an instance of UmbDocumentPermissionServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbDocumentPermissionServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	requestPermissions(id: string) {
		return tryExecuteAndNotify(
			this.#host,
			fetch(`/umbraco/management/api/v1/document/${id}/permissions`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}).then((res) => res.json()),
		);
	}
}
