import type { ManifestBase } from '@umbraco-cms/extensions-registry';
import { ManifestLoaderType } from './load-extension.function';

export function isManifestLoaderType(manifest: ManifestBase): manifest is ManifestLoaderType {
	return typeof (manifest as ManifestLoaderType).loader === 'function';
}
