type Block = { readonly left: number; readonly right: number; readonly size: number };

export function sequenceRatio(left: string, right: string): number {
  if (!left.length && !right.length) return 1;
  const matches = matchingBlocks(left, right)
    .reduce((total, block) => total + block.size, 0);
  return (2 * matches) / (left.length + right.length);
}

function matchingBlocks(left: string, right: string): Block[] {
  const pending: number[][] = [[0, left.length, 0, right.length]];
  const blocks: Block[] = [];
  while (pending.length) {
    const [leftStart, leftEnd, rightStart, rightEnd] = pending.pop()!;
    const block = longestBlock(left, right, leftStart, leftEnd, rightStart, rightEnd);
    if (!block.size) continue;
    blocks.push(block);
    pending.push([leftStart, block.left, rightStart, block.right]);
    pending.push([block.left + block.size, leftEnd, block.right + block.size, rightEnd]);
  }
  return blocks.sort((a, b) => a.left - b.left || a.right - b.right);
}

function longestBlock(
  left: string,
  right: string,
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
): Block {
  let best: Block = { left: leftStart, right: rightStart, size: 0 };
  let previous = new Map<number, number>();
  for (let index = leftStart; index < leftEnd; index += 1) {
    const current = new Map<number, number>();
    for (let position = rightStart; position < rightEnd; position += 1) {
      if (left[index] !== right[position]) continue;
      const size = (previous.get(position - 1) ?? 0) + 1;
      current.set(position, size);
      if (size > best.size) best = { left: index - size + 1, right: position - size + 1, size };
    }
    previous = current;
  }
  return best;
}
