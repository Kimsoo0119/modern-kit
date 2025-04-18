import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { InView } from '.';
import {
  mockIntersecting,
  mockIntersectionObserverCleanup,
  mockIntersectionObserverSetup,
} from '../../_internal/test/mockIntersectionObserver';
import { renderSetup } from '../../_internal/test/renderSetup';
import { ElementType } from 'react';

beforeEach(() => {
  mockIntersectionObserverSetup();
});

afterEach(() => {
  mockIntersectionObserverCleanup();
});

interface TestComponentProps {
  onIntersectStart: () => void;
  onIntersectEnd: () => void;
  as?: ElementType;
  calledOnce?: boolean;
  asChild?: boolean;
}

const TestComponent = ({
  onIntersectStart,
  onIntersectEnd,
  as,
  calledOnce,
}: TestComponentProps) => {
  return (
    <InView
      as={as}
      onIntersectStart={onIntersectStart}
      onIntersectEnd={onIntersectEnd}
      calledOnce={calledOnce}>
      <div>box</div>
    </InView>
  );
};

describe('InView', () => {
  const intersectStartMock = vi.fn();
  const intersectEndMock = vi.fn();

  it('InView 컴포넌트가 viewport에 노출되거나 숨겨질 때 onIntersect 콜백 함수를 호출해야 합니다. 기본적으로 div 요소로 렌더링되어야 합니다.', async () => {
    renderSetup(
      <TestComponent
        onIntersectStart={intersectStartMock}
        onIntersectEnd={intersectEndMock}
      />
    );

    const boxWrapper = screen.getByText('box').parentElement as HTMLElement;
    expect(boxWrapper.tagName).toBe('DIV');

    expect(intersectStartMock).toBeCalledTimes(0);
    expect(intersectEndMock).toBeCalledTimes(0);

    await waitFor(() =>
      mockIntersecting({ type: 'view', element: boxWrapper })
    );
    expect(intersectStartMock).toBeCalledTimes(1);

    await waitFor(() =>
      mockIntersecting({ type: 'hide', element: boxWrapper })
    );
    expect(intersectEndMock).toBeCalledTimes(1);
  });

  it('as props를 통해 특정 요소로 렌더링할 수 있습니다.', async () => {
    renderSetup(
      <TestComponent
        as="ul"
        onIntersectStart={intersectStartMock}
        onIntersectEnd={intersectEndMock}
      />
    );

    const ulWrapper = screen.getByText('box').parentElement as HTMLElement;
    expect(ulWrapper.tagName).toBe('UL');

    await waitFor(() => mockIntersecting({ type: 'view', element: ulWrapper }));
    expect(intersectStartMock).toBeCalledTimes(1);

    await waitFor(() => mockIntersecting({ type: 'hide', element: ulWrapper }));
    expect(intersectEndMock).toBeCalledTimes(1);
  });

  it('asChild props를 통해 자식 요소를 그대로 렌더링하고, 자식 요소를 관찰 대상으로 설정할 수 있습니다.', async () => {
    renderSetup(
      <TestComponent
        onIntersectStart={intersectStartMock}
        onIntersectEnd={intersectEndMock}
        asChild={true}
      />
    );

    const boxWrapper = screen.getByText('box');
    expect(boxWrapper.tagName).toBe('DIV');

    await waitFor(() =>
      mockIntersecting({ type: 'view', element: boxWrapper })
    );
    expect(intersectStartMock).toBeCalledTimes(1);

    await waitFor(() =>
      mockIntersecting({ type: 'hide', element: boxWrapper })
    );
    expect(intersectEndMock).toBeCalledTimes(1);
  });

  it('asChild가 true일 때 children이 유효한 React 요소가 아니면 에러를 반환해야 합니다.', () => {
    expect(() =>
      renderSetup(<InView asChild={true}>일반 텍스트 노드</InView>)
    ).toThrow();
  });
});
