import { css } from '@emotion/css';
import React, { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AccessoryButton } from '@grafana/experimental';
import { FetchError } from '@grafana/runtime';
import { useStyles2 } from '@grafana/ui';

import { TraceqlFilter, TraceqlSearchScope } from '../dataquery.gen';
import { TempoDatasource } from '../datasource';
import { Scope, Tags } from '../types';

import SearchField from './SearchField';
import { getUnscopedTags } from './utils';

const getStyles = () => ({
  vertical: css`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  `,
  horizontal: css`
    display: flex;
    flex-direction: row;
    gap: 1rem;
  `,
});

interface Props {
  updateFilter: (f: TraceqlFilter) => void;
  deleteFilter: (f: TraceqlFilter) => void;
  filters: TraceqlFilter[];
  datasource: TempoDatasource;
  setError: (error: FetchError) => void;
  tags: Tags | undefined;
  isTagsLoading: boolean;
  hideValues?: boolean;
}
const TagsInput = ({
  updateFilter,
  deleteFilter,
  filters,
  datasource,
  setError,
  tags,
  isTagsLoading,
  hideValues,
}: Props) => {
  const styles = useStyles2(getStyles);
  const generateId = () => uuidv4().slice(0, 8);
  const handleOnAdd = useCallback(
    () => updateFilter({ id: generateId(), operator: '=', scope: TraceqlSearchScope.Span }),
    [updateFilter]
  );

  useEffect(() => {
    if (!filters?.length) {
      handleOnAdd();
    }
  }, [filters, handleOnAdd]);

  const getTags = (f: TraceqlFilter) => {
    if (tags) {
      if (tags.v1) {
        return tags.v1;
      } else if (tags.v2) {
        if (f.scope === TraceqlSearchScope.Unscoped) {
          return getUnscopedTags(tags.v2);
        }
        const scope = tags.v2.find((scope: Scope) => scope.name && scope.name === f.scope);
        return scope && scope.tags ? scope.tags : [];
      }
    }
    return [];
  };

  return (
    <div className={styles.vertical}>
      {filters?.map((f, i) => (
        <div className={styles.horizontal} key={f.id}>
          <SearchField
            filter={f}
            datasource={datasource}
            setError={setError}
            updateFilter={updateFilter}
            tags={getTags(f)}
            isTagsLoading={isTagsLoading}
            deleteFilter={deleteFilter}
            allowDelete={true}
            hideValue={hideValues}
          />
          {i === filters.length - 1 && (
            <AccessoryButton variant={'secondary'} icon={'plus'} onClick={handleOnAdd} title={'Add tag'} />
          )}
        </div>
      ))}
    </div>
  );
};

export default TagsInput;
