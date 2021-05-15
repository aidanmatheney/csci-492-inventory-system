namespace InventorySystemServer.Data.Services.DynamicQuery
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    using InventorySystemServer.Utils;

    public sealed record DynamicQueryFilterParameter
    {
        public DynamicQueryFilterParameter(string Field, DynamicQueryFilterOperator Operator, IReadOnlyList<string?> Arguments)
        {
            ValidateArgumentsNotNull(DynamicQueryFilterOperator.ContainsAny, nameof(DynamicQueryFilterOperator.ContainsAny), Operator, Arguments);
            ValidateArgumentCountEquals(DynamicQueryFilterOperator.Range, nameof(DynamicQueryFilterOperator.Range), 2, "minimum (inclusive), maximum (inclusive)", Operator, Arguments);

            this.Field = Field;
            this.Operator = Operator;
            this.Arguments = Arguments;
        }

        public string Field { get; init; }
        public DynamicQueryFilterOperator Operator { get; init; }
        public IReadOnlyList<string?> Arguments { get; init; }

        public void Deconstruct(out string field, out DynamicQueryFilterOperator op, out IReadOnlyList<string?> arguments)
        {
            field = Field;
            op = Operator;
            arguments = Arguments;
        }

        private static void ValidateArgumentsNotNull(DynamicQueryFilterOperator ruleOperator, string ruleOperatorName, DynamicQueryFilterOperator inputOperator, IReadOnlyList<string?> inputArguments)
        {
            if (inputOperator == ruleOperator && inputArguments.Any(Predicates.IsNull))
            {
                throw new ArgumentException($"{ruleOperatorName} operator arguments must not be null");
            }
        }

        private static void ValidateArgumentCountEquals(DynamicQueryFilterOperator ruleOperator, string ruleOperatorName, int ruleArgumentCount, string ruleArgumentDescriptions, DynamicQueryFilterOperator inputOperator, IReadOnlyList<string?> inputArguments)
        {
            if (inputOperator == ruleOperator && inputArguments.Count != ruleArgumentCount)
            {
                throw new ArgumentException($"{ruleOperatorName} operator has {ruleArgumentCount} arguments: {ruleArgumentDescriptions}");
            }
        }
    }
}