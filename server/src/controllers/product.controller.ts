import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.js';
import * as productService from '../services/product.service.js';
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  createVariantSchema,
  updateVariantSchema,
  queryProductSchema,
} from '../validators/product.validator.js';

export async function listProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = queryProductSchema.parse(req.query);
    const result = await productService.listProducts(query, req.user?.role);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id, req.user?.role);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productService.createProduct(input, req.user?.id);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, input, req.user?.id);
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProductStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = updateProductStatusSchema.parse(req.body);
    const product = await productService.updateProductStatus(req.params.id, status, req.user?.id);
    return res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// Product Variants
// ==========================================

export async function getVariant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const variant = await productService.getVariantById(req.params.id);
    return res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (err) {
    next(err);
  }
}

export async function listVariants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await productService.listVariantsByProduct(req.params.productId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function createVariant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = createVariantSchema.parse(req.body);
    const variant = await productService.createVariant(req.params.productId, input, req.user?.id);
    return res.status(201).json({
      success: true,
      message: 'Product variant created successfully',
      data: variant,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVariant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = updateVariantSchema.parse(req.body);
    const variant = await productService.updateVariant(req.params.id, input, req.user?.id);
    return res.status(200).json({
      success: true,
      message: 'Product variant updated successfully',
      data: variant,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVariantStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = updateProductStatusSchema.parse(req.body);
    const variant = await productService.updateVariantStatus(req.params.id, status, req.user?.id);
    return res.status(200).json({
      success: true,
      message: `Variant status updated to ${status}`,
      data: variant,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVariant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteVariant(req.params.id, req.user?.id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

