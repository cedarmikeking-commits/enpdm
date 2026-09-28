/**
 * 数组转树形结构
 * @param data 原始扁平数组
 * @param idKey 节点 id 字段名
 * @param parentIdKey 父节点 id 字段名
 * @param childrenKey 子节点字段名
 * @returns 树形结构数组
 */
export const generateTreeData = (
  data: any[],
  idKey: string,
  parentIdKey: string,
  childrenKey: string
) => {
  const treeData: any[] = [];
  const record: { [key: string]: any } = {};

  data.forEach(item => {
    record[item[idKey]] = { ...item, [childrenKey]: [] };
  });

  data.forEach(item => {
    const parentId = item[parentIdKey];
    if (parentId && record[parentId]) {
      record[parentId][childrenKey].push(record[item[idKey]]);
    } else {
      treeData.push(record[item[idKey]]);
    }
  });

  return treeData;
};

/**
 * 返回所有节点从根到该节点的路径组合
 * @param data 原始扁平数组
 * @param idKey 节点 id 字段名
 * @param parentIdKey 父节点 id 字段名
 * @returns 路径组合数组，例如 [[root, a, leaf1], [root, b], ...]
 */
export const findAllParentCombinations = (
  data: any[],
  idKey: string,
  parentIdKey: string
): any[][] => {
  const record: Record<string | number, any> = {};
  data.forEach(item => {
    record[item[idKey]] = item;
  });

  // 记忆化每个节点的“从根到该节点”的路径
  const pathCache: Record<string | number, any[] | undefined> = {};

  const buildPath = (id: string | number): any[] => {
    const cached = pathCache[id];
    if (cached) return cached;

    const node = record[id];
    if (!node) return [];

    const parentId = node[parentIdKey];
    if (!parentId) {
      const path = [node];
      pathCache[id] = path;
      return path;
    }

    const parentPath = buildPath(parentId);
    const path = parentPath.length ? [...parentPath, node] : [node];
    pathCache[id] = path;
    return path;
  };

  const results: any[][] = [];
  data.forEach(item => {
    const id = item[idKey];
    if (item[parentIdKey] === '0') return;
    const path = buildPath(id);
    if (path.length) results.push(path);
  });

  return results;
};
/**
 * 将tree形结构转换为扁平数组
 * @param treeData 树形结构数组
 * @param childrenKey 子节点字段名
 * @returns 扁平数组
 */
export const flattenTreeData = (treeData: any[], childrenKey: string): any[] => {
  const results: any[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      const { [childrenKey]: children, ...rest } = node;
      results.push(rest);
      if (children && children.length) {
        traverse(children);
      }
    });
  };

  traverse(treeData);

  return results;
};

/**
 * 根据key值查找节点
 * @param treeData 树形结构数组
 * @param key 查找的key值
 * @param keyName key字段名
 * @param childrenKey 子节点字段名
 * @returns 找到的节点或null
 */
export const findNodeByKey = (
  treeData: any[],
  key: string | number,
  keyName: string,
  childrenKey: string
): any | null => {
  let result: any | null = null;

  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node[keyName] === key) {
        result = node;
        return;
      }
      if (node[childrenKey] && node[childrenKey].length) {
        traverse(node[childrenKey]);
        if (result) return;
      }
    }
  };

  traverse(treeData);

  return result;
};

export default {};
