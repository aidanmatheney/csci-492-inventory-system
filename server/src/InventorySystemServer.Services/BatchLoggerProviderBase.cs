namespace InventorySystemServer.Services
{
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Threading.Tasks;

    using InventorySystemServer.Data.Models;
    using InventorySystemServer.Utils;

    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;

    public abstract class BatchLoggerProviderBase : BatchExecutorBase<WebApiLogEntry>, ILoggerProvider
    {
        protected BatchLoggerProviderBase
        (
            TimeSpan flushInterval,
            LogLevel logLevel,
            IServiceProvider serviceProvider
        ) : base
        (
            flushInterval,
            serviceProvider
        )
        {
            LogLevel = logLevel;
        }

        protected LogLevel LogLevel { get; }

        public ILogger CreateLogger(string categoryName)
        {
            Guard.NotNull(categoryName, nameof(categoryName));
            return new ToQueueLogger(this, categoryName);
        }

        protected sealed override Task HandleExceptionAsync(Exception ex, IEnumerable<WebApiLogEntry> entries, IServiceProvider scopedServiceProvider)
        {
            var logger = scopedServiceProvider.GetRequiredService<ILogger<BatchLoggerProviderBase>>();
            logger.LogCritical(ex, "Error flushing web API log messages");
            return Task.CompletedTask;
        }

        private sealed class ToQueueLogger : ILogger
        {
            private readonly BatchLoggerProviderBase _provider;
            private readonly string _category;
            private readonly ConcurrentStack<string> _scopes = new ConcurrentStack<string>();

            public ToQueueLogger(BatchLoggerProviderBase provider, string category)
            {
                Debug.Assert(provider is not null);
                Debug.Assert(category is not null);

                _provider = provider;
                _category = category;
            }

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            {
                if (!IsEnabled(logLevel))
                    return;

                var scope = _scopes.Count == 0
                    ? null
                    : string.Join(" > ", _scopes);

                var entry = new WebApiLogEntry
                {
                    TimeWritten = DateTimeOffset.Now,
                    ServerName = Environment.MachineName,

                    Category = _category,
                    Scope = scope,
                    LogLevel = logLevel.ToString(),
                    EventId = eventId.Id,
                    EventName = eventId.Name,
                    Message = formatter(state, exception),
                    Exception = exception?.ToString()
                };
                _provider.Enqueue(entry);
            }

            public bool IsEnabled(LogLevel logLevel)
                => logLevel >= _provider.LogLevel;

            public IDisposable BeginScope<TState>(TState state)
            {
                var stateString = state?.ToString();
                if (string.IsNullOrWhiteSpace(stateString))
                    throw new ArgumentException("State string is null or white space", nameof(state));

                _scopes.Push(stateString);
                return new ActionDisposable(() =>
                {
                    var scopeWasPopped = _scopes.TryPop(out _);
                    Debug.Assert(scopeWasPopped);
                });
            }
        }
    }
}
