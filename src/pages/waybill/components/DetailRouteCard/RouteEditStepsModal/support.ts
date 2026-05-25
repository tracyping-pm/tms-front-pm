import { cloneDeep, uniqBy } from 'lodash';
import { ISelectedRouteListDataType } from './SelectedRoutesModal';

export const STEP_EVENTS = {
  STEP1_NEXT_TRIGGER: 'STEP1_NEXT_TRIGGER',
  STEP2_NEXT_TRIGGER: 'STEP2_NEXT_TRIGGER',
};

export const deDuplication = (arr: any[], id = 'id') => {
  return uniqBy(arr, id);
};

export const buildVid = (item: any, prefix?: string) => {
  const padId = item?.padId ?? '';
  const sadId = item?.sadId ?? '';
  const tadId = item?.tadId ?? '';
  const label = item?.label ?? '';

  return `${prefix ?? ''}${padId}${sadId}${tadId}${label}`;
};

// 得到一颗树的某一层的所有节点
export const getNodesByLevel = (tree: any[], level: number) => {
  let nodes: any[] = [];
  tree.forEach((item) => {
    if (item.level === level) {
      nodes.push(item);
    } else if (item.children) {
      nodes = nodes.concat(getNodesByLevel(item.children, level));
    }
  });
  return nodes;
};

// 构建一颗树，入参是一个扁平化的一维数组，根据parentId返回一颗树，并带有level属性
export const buildTree = (list: any[], idName = 'id') => {
  const cloneList = cloneDeep(list);
  const flattenList = cloneList.map((item) => {
    item.children = [];
    return item;
  });
  const tree: any[] = [];
  const map: any = {};
  flattenList.forEach((item) => {
    map[item[idName]] = item;
  });

  cloneList.forEach((item) => {
    const parent = map[item.parentId];
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
      item.level = parent.level + 1;
    } else {
      tree.push(item);
      item.level = 1;
    }
  });
  return tree;
};

export const flattenTree = (tree: any[]) => {
  const list: any[] = [];
  tree.forEach((item) => {
    list.push(item);
    if (item.children) {
      list.push(...flattenTree(item.children));
    }
  });
  return list;
};

export const retainLevelTree = (tree: any[], level: number) => {
  const list = flattenTree(tree);

  const newList: any[] = [];
  list.forEach((item) => {
    if (item.level === level) {
      newList.push(item);
    }
  });
  return newList;
};

export const deleteNode = (tree: any[], idValue: string, idName = 'id') => {
  tree.forEach((item, index) => {
    if (item[idName] === idValue) {
      tree.splice(index, 1);
    } else if (item.children) {
      deleteNode(item.children, idValue, idName);
    }
  });
};

export const findNode = (tree: any[], idValue: string, idName = 'id') => {
  let node: any = null;
  tree.forEach((item) => {
    if (item[idName] === idValue) {
      node = item;
    } else if (item?.children?.length > 0) {
      const find = findNode(item.children, idValue, idName);
      if (find) {
        node = find;
      }
    }
  });
  return node;
};

// 删除一个节点，如果这个节点的父节点没有其他子节点了，那么也删除父节点,注意，这个节点是从叶子节点开始删除的
export const deleteNodeAndParentIfNoChildren = (
  tree: any[],
  id: string,
  idName = 'id',
) => {
  const node = findNode(tree, id, idName);
  if (node) {
    deleteNode(tree, node[idName], idName);
    const parentNode = findNode(tree, node.parentId, idName);
    if (parentNode && parentNode?.children?.length === 0) {
      deleteNodeAndParentIfNoChildren(tree, parentNode[idName], idName);
    }
  }
  return tree;
};

export const buildOriginRouteIds = (tree: any[]) => {
  tree.forEach((level1Item) => {
    if (level1Item.level === 1) {
      level1Item.routeIds = [];
      level1Item.children?.forEach?.((level2Item: any) => {
        level2Item?.children?.forEach?.((level3Item: any) => {
          if (level3Item.routeId || level3Item.routeId === 0) {
            level1Item.routeIds.push(level3Item.routeId);
          }
        });
      });
    }
  });
  return tree;
};

export const buildDestinationRouteIds = (tree: any[]) => {
  const map = new Map();

  tree.forEach((level2Item) => {
    const tempId = buildVid(level2Item, 'D');
    if (map.has(tempId)) {
      const existsRouteIds = map.get(tempId);
      level2Item.children?.forEach?.((level3Item: any) => {
        if (level3Item.routeId || level3Item.routeId === 0) {
          existsRouteIds.push(level3Item.routeId);
        }
      });
    } else {
      const routeIds: string[] = [];
      level2Item.children?.forEach?.((level3Item: any) => {
        if (level3Item.routeId || level3Item.routeId === 0) {
          routeIds.push(level3Item.routeId);
        }
      });
      map.set(tempId, routeIds);
    }
    level2Item.routeIds = map.get(tempId);
  });

  return tree;
};

// 获取树的所有路径
export const getTreeAllPath = (tree: any[]) => {
  const cloneTree = cloneDeep(tree);
  const paths: any = [];
  cloneTree?.forEach?.((node) => {
    if (node?.children?.length > 0) {
      const res = getTreeAllPath(node.children);
      res.forEach((item: any) => {
        delete node.children;
        delete item.children;

        paths.push([node, ...item]);
      });
    } else {
      delete node.children;
      paths.push([node]);
    }
  });

  return paths;
};

export const getSelectedRoutesListByPaths = (
  paths: any[],
): ISelectedRouteListDataType[] => {
  const list: ISelectedRouteListDataType[] = [];

  paths?.forEach?.((path) => {
    const [orignItem, destinationItem, waypointItem] = path;
    const origin = [
      orignItem?.padName,
      orignItem?.sadName,
      orignItem?.tadName,
    ].filter(Boolean);
    const originName = origin.join(', ');

    const destination = [
      destinationItem?.padName,
      destinationItem?.sadName,
      destinationItem?.tadName,
    ].filter(Boolean);
    const destinationName = destination.join(', ');

    list.push({
      vid: destinationItem?.vid,
      origin: originName,
      waypoint: waypointItem?.waypoint,
      destination: destinationName,
    });
  });

  // 把 list Item 中origin 相同的放在一起，以便后续合并单元格使用
  const grouped = list.reduce(
    (result: { [key: string]: ISelectedRouteListDataType[] }, item) => {
      const { origin } = item;
      if (!result[origin]) {
        result[origin] = [];
      }
      result[origin].push(item);
      return result;
    },
    {},
  );

  const newList = Object.values(grouped).flat();

  return newList;
};

export const checkListItemRepeat = (arr: any[], id = 'id') => {
  const ids = arr.map((item) => item?.[id]);
  const set = new Set(ids);
  return set.size !== ids.length;
};

export const mixinStopPoints = (
  normalPoints: any[] = [],
  stopPoints: any[] = [],
) => {
  const noSortList =
    normalPoints.filter(
      (item) => item.sort === undefined || item.sort === null,
    ) ?? [];
  const hasSortList =
    normalPoints.filter((item) => item.sort === 0 || !!item.sort) ?? [];
  const allSortPoints = [...hasSortList, ...stopPoints];
  // 在 Step1 新追加的 normalPoint（即没有 sort 值的点），应该在 stopPoint 后面
  const sortPoints = allSortPoints.sort((a, b) => a.sort - b.sort);

  const result = [...sortPoints, ...noSortList];

  return result;
};
