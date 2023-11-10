import { UmbUserGroupDetailDataSource } from '../types.js';
import { UmbUserGroupServerDataSource } from './sources/user-group.server.data.js';
import { UMB_USER_GROUP_ITEM_STORE_CONTEXT_TOKEN, UmbUserGroupItemStore } from './user-group-item.store.js';
import { UmbUserGroupItemServerDataSource } from './sources/user-group-item.server.data.js';
import { Observable } from '@umbraco-cms/backoffice/external/rxjs';
import {
	CreateUserGroupRequestModel,
	UpdateUserGroupRequestModel,
	UserGroupBaseModel,
	UserGroupItemResponseModel,
	UserGroupResponseModel,
} from '@umbraco-cms/backoffice/backend-api';
import {
	UmbDetailRepository,
	UmbItemDataSource,
	UmbItemRepository,
	UmbDataSourceErrorResponse,
	DataSourceResponse,
} from '@umbraco-cms/backoffice/repository';
import { UMB_NOTIFICATION_CONTEXT_TOKEN, UmbNotificationContext } from '@umbraco-cms/backoffice/notification';
import { UmbBaseController, type UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbApi } from '@umbraco-cms/backoffice/extension-api';

// TODO: implement
export class UmbUserGroupRepository extends UmbBaseController
	implements
		UmbDetailRepository<CreateUserGroupRequestModel, any, UpdateUserGroupRequestModel, UserGroupResponseModel>,
		UmbItemRepository<UserGroupItemResponseModel>,
		UmbApi
{
	#init;

	#detailSource: UmbUserGroupDetailDataSource;
	//#detailStore?: UmbUserGroupStore;

	#itemSource: UmbItemDataSource<UserGroupItemResponseModel>;
	#itemStore?: UmbUserGroupItemStore;

	#notificationContext?: UmbNotificationContext;

	constructor(host: UmbControllerHost) {
		super(host);
		this.#detailSource = new UmbUserGroupServerDataSource(this._host);
		this.#itemSource = new UmbUserGroupItemServerDataSource(this._host);

		this.#init = Promise.all([
			/*
			this.consumeContext(UMB_USER_GROUP_STORE_CONTEXT_TOKEN, (instance) => {
				this.#detailStore = instance;
			}).asPromise(),
			*/

			this.consumeContext(UMB_USER_GROUP_ITEM_STORE_CONTEXT_TOKEN, (instance) => {
				this.#itemStore = instance;
			}).asPromise(),

			this.consumeContext(UMB_NOTIFICATION_CONTEXT_TOKEN, (instance) => {
				this.#notificationContext = instance;
			}).asPromise(),
		]);
	}

	createScaffold(parentId: string | null): Promise<DataSourceResponse<UserGroupBaseModel>> {
		return this.#detailSource.createScaffold(parentId);
	}

	// ITEMS:
	async requestItems(ids: Array<string>) {
		if (!ids) throw new Error('Ids are missing');
		await this.#init;

		const { data, error } = await this.#itemSource.getItems(ids);

		if (data) {
			this.#itemStore?.appendItems(data);
		}

		return { data, error, asObservable: () => this.#itemStore!.items(ids) };
	}

	async items(ids: Array<string>) {
		await this.#init;
		return this.#itemStore!.items(ids);
	}

	// DETAIL
	async requestById(id: string) {
		if (!id) throw new Error('Id is missing');

		const { data, error } = await this.#detailSource.get(id);

		//TODO Put it in the store

		return { data, error };
	}

	byId(id: string): Promise<Observable<any>> {
		throw new Error('Method not implemented.');
	}

	async create(userGroupRequestData: any): Promise<DataSourceResponse<any>> {
		if (!userGroupRequestData) throw new Error('Data is missing');

		const { data, error } = await this.#detailSource.insert(userGroupRequestData);

		//TODO Update store

		if (!error) {
			const notification = { data: { message: `User group created` } };
			this.#notificationContext?.peek('positive', notification);
		}

		return { error };
	}

	async save(id: string, userGroup: UserGroupResponseModel) {
		if (!id) throw new Error('UserGroup id is missing');
		if (!userGroup) throw new Error('UserGroup update data is missing');

		const { data, error } = await this.#detailSource.update(id, userGroup);

		//TODO Update store

		if (!error) {
			const notification = { data: { message: `User group saved` } };
			this.#notificationContext?.peek('positive', notification);
		}

		return { data, error };
	}

	async delete(id: string): Promise<UmbDataSourceErrorResponse> {
		if (!id) throw new Error('UserGroup id is missing');

		const { error } = await this.#detailSource.delete(id);

		//TODO Update store

		if (!error) {
			const notification = { data: { message: `User group deleted` } };
			this.#notificationContext?.peek('positive', notification);
		}

		return { error };
	}
}
