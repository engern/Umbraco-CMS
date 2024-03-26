import { UMB_CURRENT_USER_MFA_ENABLE_PROVIDER_MODAL } from '../current-user-mfa-enable-provider/current-user-mfa-enable-provider-modal.token.js';
import { UmbCurrentUserRepository } from '../../repository/index.js';
import { UMB_CURRENT_USER_MFA_DISABLE_PROVIDER_MODAL } from '../current-user-mfa-disable-provider/current-user-mfa-disable-provider-modal.token.js';
import type { UmbCurrentUserMfaProviderModel } from '../../types.js';
import { css, customElement, html, property, repeat, state, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_MODAL_MANAGER_CONTEXT, type UmbModalContext } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

@customElement('umb-current-user-mfa-modal')
export class UmbCurrentUserMfaModalElement extends UmbLitElement {
	@property({ attribute: false })
	modalContext?: UmbModalContext;

	@state()
	_items: Array<UmbCurrentUserMfaProviderModel> = [];

	#currentUserRepository = new UmbCurrentUserRepository(this);

	constructor() {
		super();
		this.#loadProviders();
	}

	async #loadProviders() {
		this.observe(
			await this.#currentUserRepository.requestMfaLoginProviders(),
			(providers) => {
				this._items = providers;
			},
			'_mfaProviders',
		);
	}

	#close() {
		this.modalContext?.submit();
	}

	render() {
		return html`
			<umb-body-layout headline="${this.localize.term('member_2fa')}">
				<div id="main">
					${when(
						this._items.length > 0,
						() => html`
							${repeat(
								this._items,
								(item) => item.providerName,
								(item) => this.#renderProvider(item),
							)}
						`,
					)}
				</div>
				<div slot="actions">
					<uui-button @click=${this.#close} look="secondary" .label=${this.localize.term('general_close')}>
						${this.localize.term('general_close')}
					</uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	/**
	 * Render a provider with a toggle to enable/disable it
	 */
	#renderProvider(item: UmbCurrentUserMfaProviderModel) {
		return html`
			<uui-box headline=${item.providerName}>
				${when(
					item.isEnabledOnUser,
					() => html`
						<p style="margin-top:0">
							<umb-localize key="user_2faProviderIsEnabled">This two-factor provider is enabled</umb-localize>
							<uui-icon icon="check"></uui-icon>
						</p>
						<uui-button
							type="button"
							look="secondary"
							color="danger"
							.label=${this.localize.term('actions_disable')}
							@click=${() => this.#onProviderDisable(item)}></uui-button>
					`,
					() => html`
						<uui-button
							type="button"
							look="secondary"
							.label=${this.localize.term('actions_enable')}
							@click=${() => this.#onProviderEnable(item)}></uui-button>
					`,
				)}
			</uui-box>
		`;
	}

	/**
	 * Open the provider modal.
	 * This will show the QR code and/or other means of validation for the given provider and return the activation code.
	 * The activation code is then used to either enable the provider.
	 */
	async #onProviderEnable(item: UmbCurrentUserMfaProviderModel) {
		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		return await modalManager
			.open(this, UMB_CURRENT_USER_MFA_ENABLE_PROVIDER_MODAL, {
				data: { providerName: item.providerName },
			})
			.onSubmit()
			.catch(() => undefined);
	}

	/**
	 * Open the provider modal.
	 * This will show the QR code and/or other means of validation for the given provider and return the activation code.
	 * The activation code is then used to disable the provider.
	 */
	async #onProviderDisable(item: UmbCurrentUserMfaProviderModel) {
		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		return await modalManager
			.open(this, UMB_CURRENT_USER_MFA_DISABLE_PROVIDER_MODAL, {
				data: { providerName: item.providerName },
			})
			.onSubmit()
			.catch(() => undefined);
	}

	static styles = [
		UmbTextStyles,
		css`
			:host {
				display: block;
			}

			uui-box {
				margin-bottom: var(--uui-size-space-3);
			}
		`,
	];
}

export default UmbCurrentUserMfaModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-current-user-mfa-modal': UmbCurrentUserMfaModalElement;
	}
}
