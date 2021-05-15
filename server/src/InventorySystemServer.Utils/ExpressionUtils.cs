namespace InventorySystemServer.Utils
{
    using System;
    using System.Linq.Expressions;
    using System.Reflection;

    using Dawn;

    public static class ExpressionUtils
    {
        public static string GetImmediatePropertyName<TEntity, TProperty>(this Expression<Func<TEntity, TProperty>> immediatePropertySelector)
        {
            Guard.Argument(immediatePropertySelector, nameof(immediatePropertySelector)).NotNull();

            if
            (
                immediatePropertySelector.Body is not MemberExpression memberExpression
                || memberExpression.Expression is not ParameterExpression
                || memberExpression.Member.MemberType != MemberTypes.Property
            )
            {
                throw new ArgumentException("Selector must select an immediate property of the entity", nameof(immediatePropertySelector));
            }

            return memberExpression.Member.Name;
        }
    }
}