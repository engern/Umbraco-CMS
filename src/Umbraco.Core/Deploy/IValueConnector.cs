using Umbraco.Cms.Core.Models;

namespace Umbraco.Cms.Core.Deploy;

/// <summary>
/// Defines methods that can convert a property value to and from an environment-agnostic string.
/// </summary>
/// <remarks>
/// Property values may contain values such as content identifiers, that would be local
/// to one environment and need to be converted in order to be deployed. Connectors also deal
/// with serializing and deserializing the content value to an environment-agnostic string.
/// </remarks>
public interface IValueConnector
{
    /// <summary>
    /// Gets the property editor aliases that the value converter supports by default.
    /// </summary>
    /// <value>
    /// The property editor aliases.
    /// </value>
    IEnumerable<string> PropertyEditorAliases { get; }

    /// <summary>
    /// Gets the deploy property value corresponding to a content property value, and gather dependencies.
    /// </summary>
    /// <param name="value">The content property value.</param>
    /// <param name="propertyType">The value property type</param>
    /// <param name="dependencies">The content dependencies.</param>
    /// <param name="contextCache">The context cache.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains the deploy property value.
    /// </returns>
    Task<string?> ToArtifactAsync(
        object? value,
        IPropertyType propertyType,
        ICollection<ArtifactDependency> dependencies,
        IContextCache contextCache,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the content property value corresponding to a deploy property value.
    /// </summary>
    /// <param name="value">The deploy property value.</param>
    /// <param name="propertyType">The value property type</param>
    /// <param name="currentValue">The current content property value.</param>
    /// <param name="contextCache">The context cache.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains the content property value.
    /// </returns>
    Task<object?> FromArtifactAsync(
        string? value,
        IPropertyType propertyType,
        object? currentValue,
        IContextCache contextCache,
        CancellationToken cancellationToken = default);
}
