import { describe, it, expect } from 'vitest';
import {
  camelCase,
  controllerClassName,
  controllerFileName,
  kebabCase,
  lowerFirst,
  modelClassName,
  pascalCase,
  pluralize,
  singularize,
  snakeCase,
  socketClassName,
  socketFileName,
  upperFirst,
  words,
} from './naming.js';

describe('case helpers', () => {
  it('lowerFirst / upperFirst flip the first character', () => {
    expect(lowerFirst('User')).toBe('user');
    expect(upperFirst('user')).toBe('User');
    expect(lowerFirst('')).toBe('');
    expect(upperFirst('')).toBe('');
  });

  it('splits identifiers of any case into words', () => {
    expect(words('blogPost')).toEqual(['blog', 'Post']);
    expect(words('BlogPost')).toEqual(['Blog', 'Post']);
    expect(words('blog-post')).toEqual(['blog', 'post']);
    expect(words('blog_post')).toEqual(['blog', 'post']);
    expect(words('blog post')).toEqual(['blog', 'post']);
  });

  it.each([
    ['blog post', 'BlogPost'],
    ['blog-post', 'BlogPost'],
    ['blogPost', 'BlogPost'],
  ])('pascalCase(%s) -> %s', (input, expected) => {
    expect(pascalCase(input)).toBe(expected);
  });

  it('camelCase / kebabCase / snakeCase', () => {
    expect(camelCase('BlogPost')).toBe('blogPost');
    expect(kebabCase('BlogPost')).toBe('blog-post');
    expect(snakeCase('BlogPost')).toBe('blog_post');
  });
});

describe('pluralize / singularize', () => {
  it.each([
    ['post', 'posts'],
    ['box', 'boxes'],
    ['category', 'categories'],
    ['leaf', 'leaves'],
    ['person', 'people'],
  ])('pluralize(%s) -> %s', (input, expected) => {
    expect(pluralize(input)).toBe(expected);
  });

  it.each([
    ['posts', 'post'],
    ['boxes', 'box'],
    ['categories', 'category'],
    ['people', 'person'],
  ])('singularize(%s) -> %s', (input, expected) => {
    expect(singularize(input)).toBe(expected);
  });

  it('round-trips simple words', () => {
    expect(singularize(pluralize('comment'))).toBe('comment');
  });
});

describe('framework name builders', () => {
  it('controller names', () => {
    expect(controllerClassName('users')).toBe('UsersController');
    expect(controllerFileName('Users')).toBe('usersController');
  });

  it('model names are singular Pascal', () => {
    expect(modelClassName('users')).toBe('User');
    expect(modelClassName('blog-posts')).toBe('BlogPost');
  });

  it('socket names', () => {
    expect(socketClassName('chat')).toBe('ChatSocket');
    expect(socketFileName('Chat')).toBe('chatSocket');
  });
});
