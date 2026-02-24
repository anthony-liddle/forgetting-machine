import { describe, it, expect, beforeEach } from 'vitest';
import { createElement, clearContainer } from '../dom';

describe('createElement', () => {
  it('creates an element with tag, className, and text', () => {
    const el = createElement('p', 'test-class', 'Hello');
    expect(el.tagName).toBe('P');
    expect(el.className).toBe('test-class');
    expect(el.textContent).toBe('Hello');
  });

  it('creates an element without optional params', () => {
    const el = createElement('div');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('');
    expect(el.textContent).toBe('');
  });
});

describe('clearContainer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    const child1 = document.createElement('p');
    child1.textContent = 'child 1';
    const child2 = document.createElement('p');
    child2.textContent = 'child 2';
    container.appendChild(child1);
    container.appendChild(child2);
  });

  it('removes all children from a container', () => {
    clearContainer(container);
    expect(container.children.length).toBe(0);
    expect(container.childNodes.length).toBe(0);
  });
});
