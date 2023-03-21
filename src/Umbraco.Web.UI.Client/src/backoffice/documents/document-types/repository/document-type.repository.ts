import type {
	RepositoryTreeDataSource,
	UmbTreeRepository,
	UmbDetailRepository,
} from '@umbraco-cms/backoffice/repository';
import { UmbControllerHostInterface } from '@umbraco-cms/backoffice/controller';
import { UmbContextConsumerController } from '@umbraco-cms/backoffice/context-api';
import { ProblemDetailsModel, DocumentTypeResponseModel } from '@umbraco-cms/backoffice/backend-api';
import { UmbNotificationContext, UMB_NOTIFICATION_CONTEXT_TOKEN } from '@umbraco-cms/backoffice/notification';
import { DocumentTypeTreeServerDataSource } from './sources/document-type.tree.server.data';
import { UmbDocumentTypeServerDataSource } from './sources/document-type.server.data';
import { UmbDocumentTypeTreeStore, UMB_DOCUMENT_TYPE_TREE_STORE_CONTEXT_TOKEN } from './document-type.tree.store';
import { UmbDocumentTypeStore, UMB_DOCUMENT_TYPE_STORE_CONTEXT_TOKEN } from './document-type.store';

type ItemType = DocumentTypeResponseModel;

export class UmbDocumentTypeRepository implements UmbTreeRepository, UmbDetailRepository<ItemType> {
	#init!: Promise<unknown>;

	#host: UmbControllerHostInterface;

	#treeSource: RepositoryTreeDataSource;
	#treeStore?: UmbDocumentTypeTreeStore;

	#detailDataSource: UmbDocumentTypeServerDataSource;
	#detailStore?: UmbDocumentTypeStore;

	#notificationContext?: UmbNotificationContext;

	constructor(host: UmbControllerHostInterface) {
		this.#host = host;

		// TODO: figure out how spin up get the correct data source
		this.#treeSource = new DocumentTypeTreeServerDataSource(this.#host);
		this.#detailDataSource = new UmbDocumentTypeServerDataSource(this.#host);

		this.#init = Promise.all([
			new UmbContextConsumerController(this.#host, UMB_DOCUMENT_TYPE_TREE_STORE_CONTEXT_TOKEN, (instance) => {
				this.#treeStore = instance;
			}),

			new UmbContextConsumerController(this.#host, UMB_DOCUMENT_TYPE_STORE_CONTEXT_TOKEN, (instance) => {
				this.#detailStore = instance;
			}),

			new UmbContextConsumerController(this.#host, UMB_NOTIFICATION_CONTEXT_TOKEN, (instance) => {
				this.#notificationContext = instance;
			}),
		]);
	}

	// TODO: Trash
	// TODO: Move

	async requestRootTreeItems() {
		await this.#init;

		const { data, error } = await this.#treeSource.getRootItems();

		if (data) {
			this.#treeStore?.appendItems(data.items);
		}

		return { data, error, asObservable: () => this.#treeStore!.rootItems };
	}

	async requestTreeItemsOf(parentKey: string | null) {
		await this.#init;

		if (!parentKey) {
			const error: ProblemDetailsModel = { title: 'Parent key is missing' };
			return { data: undefined, error };
		}

		const { data, error } = await this.#treeSource.getChildrenOf(parentKey);

		if (data) {
			this.#treeStore?.appendItems(data.items);
		}

		return { data, error, asObservable: () => this.#treeStore!.childrenOf(parentKey) };
	}

	async requestTreeItems(keys: Array<string>) {
		await this.#init;

		if (!keys) {
			const error: ProblemDetailsModel = { title: 'Keys are missing' };
			return { data: undefined, error };
		}

		const { data, error } = await this.#treeSource.getItems(keys);

		return { data, error, asObservable: () => this.#treeStore!.items(keys) };
	}

	async rootTreeItems() {
		await this.#init;
		return this.#treeStore!.rootItems;
	}

	async treeItemsOf(parentKey: string | null) {
		await this.#init;
		return this.#treeStore!.childrenOf(parentKey);
	}

	async treeItems(keys: Array<string>) {
		await this.#init;
		return this.#treeStore!.items(keys);
	}

	// DETAILS:

	async createScaffold(parentKey: string | null) {
		if (!parentKey) throw new Error('Parent key is missing');
		await this.#init;
		return this.#detailDataSource.createScaffold(parentKey);
	}

	async requestByKey(key: string) {
		if (!key) throw new Error('Key is missing');
		await this.#init;

		const { data, error } = await this.#detailDataSource.get(key);

		if (data) {
			this.#detailStore?.append(data);
		}

		return { data, error };
	}

	async byKey(key: string) {
		if (!key) throw new Error('Key is missing');
		await this.#init;
		return this.#detailStore!.byKey(key);
	}

	// TODO: we need to figure out where to put this
	async requestAllowedChildTypesOf(key: string) {
		if (!key) throw new Error('Key is missing');
		await this.#init;
		return this.#detailDataSource.getAllowedChildrenOf(key);
	}

	// Could potentially be general methods:

	async create(template: ItemType) {
		if (!template || !template.key) throw new Error('Template is missing');
		await this.#init;

		const { error } = await this.#detailDataSource.insert(template);

		if (!error) {
			const notification = { data: { message: `Document created` } };
			this.#notificationContext?.peek('positive', notification);

			// TODO: we currently don't use the detail store for anything.
			// Consider to look up the data before fetching from the server
			this.#detailStore?.append(template);
			// TODO: Update tree store with the new item? or ask tree to request the new item?
		}

		return { error };
	}

	async save(item: ItemType) {
		if (!item || !item.key) throw new Error('Document-Type is missing');
		await this.#init;

		const { error } = await this.#detailDataSource.update(item);

		if (!error) {
			const notification = { data: { message: `Document saved` } };
			this.#notificationContext?.peek('positive', notification);

			// TODO: we currently don't use the detail store for anything.
			// Consider to look up the data before fetching from the server
			// Consider notify a workspace if a template is updated in the store while someone is editing it.
			this.#detailStore?.append(item);
			this.#treeStore?.updateItem(item.key, { name: item.name });
			// TODO: would be nice to align the stores on methods/methodNames.
		}

		return { error };
	}

	// General:

	async delete(key: string) {
		if (!key) throw new Error('Document key is missing');
		await this.#init;

		const { error } = await this.#detailDataSource.delete(key);

		if (!error) {
			const notification = { data: { message: `Document deleted` } };
			this.#notificationContext?.peek('positive', notification);

			// TODO: we currently don't use the detail store for anything.
			// Consider to look up the data before fetching from the server.
			// Consider notify a workspace if a template is deleted from the store while someone is editing it.
			this.#detailStore?.remove([key]);
			this.#treeStore?.removeItem(key);
			// TODO: would be nice to align the stores on methods/methodNames.
		}

		return { error };
	}
}
