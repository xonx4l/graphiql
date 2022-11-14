import * as React from 'react';

import { isType } from 'graphql';

// components
import { ChevronLeftIcon, Spinner } from '@graphiql/react';
import { FieldDocumentation } from '../FieldDocumentation';
import { SchemaDocumentation } from '../SchemaDocumentation';
import { Search } from '../Search';
import { TypeDocumentation } from '../TypeDocumentation';

// context
import { useSchemaContext } from '@graphiql/react';

// hooks
import { useDocExplorer } from '../../hooks';

// styles
import './DocExplorer.css';

export function DocExplorer() {
  const { fetchError, isFetching, schema, validationErrors } = useSchemaContext(
    {
      nonNull: true,
      caller: DocExplorer,
    },
  );

  const { explorerNavStack, pop, reset } = useDocExplorer();

  const navItem = explorerNavStack[explorerNavStack.length - 1];

  let content: React.ReactNode = null;
  if (fetchError) {
    content = (
      <div className="graphiql-doc-explorer-error">Error fetching schema</div>
    );
  } else if (validationErrors.length > 0) {
    content = (
      <div className="graphiql-doc-explorer-error">
        Schema is invalid: {validationErrors[0].message}
      </div>
    );
  } else if (isFetching) {
    reset();
    // Schema is undefined when it is being loaded via introspection.
    content = <Spinner />;
  } else if (!schema) {
    // Schema is null when it explicitly does not exist, typically due to
    // an error during introspection.
    content = (
      <div className="graphiql-doc-explorer-error">
        No GraphQL schema available
      </div>
    );
  } else if (explorerNavStack.length === 1) {
    content = <SchemaDocumentation schema={schema} />;
  } else if (isType(navItem.def)) {
    content = <TypeDocumentation type={navItem.def} />;
  } else if (navItem.def) {
    content = <FieldDocumentation field={navItem.def} />;
  }

  let prevName;
  if (explorerNavStack.length > 1) {
    prevName = explorerNavStack[explorerNavStack.length - 2].name;
  }

  return (
    <section
      className="graphiql-doc-explorer"
      aria-label="Documentation Explorer"
    >
      <div className="graphiql-doc-explorer-header">
        <div className="graphiql-doc-explorer-header-content">
          {prevName && (
            <button
              // href="#"
              className="graphiql-doc-explorer-back"
              onClick={pop}
              aria-label={`Go back to ${prevName}`}
            >
              <ChevronLeftIcon />
              {prevName}
            </button>
          )}
          <div className="graphiql-doc-explorer-title">{navItem.name}</div>
        </div>
        <div className="graphiql-doc-explorer-search">
          <Search key={navItem.name} />
        </div>
      </div>
      <div className="graphiql-doc-explorer-content">{content}</div>
    </section>
  );
}