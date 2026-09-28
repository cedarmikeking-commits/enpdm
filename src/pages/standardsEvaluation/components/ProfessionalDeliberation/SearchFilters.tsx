import React, { useMemo } from 'react';
import { Space, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useCareerTree } from '@/hooks/useCareerTree';

interface SearchFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedDomain: number | undefined;
  onDomainChange: (value: number | undefined) => void;
  loading?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchText,
  onSearchChange,
  selectedDomain,
  onDomainChange,
  loading,
}) => {
  const { getCareerTree, getParent } = useCareerTree();
  const domains = useMemo(() => {
    let domains: any[] = [{ id: '', name: '全部领域' }];
    getCareerTree().map((firstNote) => {
      firstNote.children?.map((secondNote) => {
        secondNote.children?.map((thirdNote) => domains.push(thirdNote));
      });
    });
    return domains;
  }, [getCareerTree()]);

  return (
    <div className="w-full grid grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
      <div>
        <Input
          placeholder="搜索标准名称..."
          prefix={<SearchOutlined />}
          value={searchText}
          className="w-full"
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          size="large"
        />
      </div>
      <div>
        <Select
          placeholder="选择专业领域"
          className="w-full"
          value={selectedDomain}
          onChange={onDomainChange}
          loading={loading}
          allowClear
          showSearch
          size="large"
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {domains.map((domain) => (
            <Select.Option key={domain.id} value={domain.id}>
              {domain.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};
