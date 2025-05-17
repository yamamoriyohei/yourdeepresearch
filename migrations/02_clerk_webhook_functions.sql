-- migrations/02_clerk_webhook_functions.sql
-- Clerkのwebhookを処理するための関数

-- ユーザー作成関数
CREATE OR REPLACE FUNCTION public.handle_clerk_user_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, avatar_url, created_at)
    VALUES (
        NEW.id,
        NEW.email_addresses[1]->>'email_address',
        NEW.first_name,
        NEW.last_name,
        NEW.image_url,
        NEW.created_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー更新関数
CREATE OR REPLACE FUNCTION public.handle_clerk_user_updated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        email = NEW.email_addresses[1]->>'email_address',
        first_name = NEW.first_name,
        last_name = NEW.last_name,
        avatar_url = NEW.image_url,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー削除関数
CREATE OR REPLACE FUNCTION public.handle_clerk_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users
    WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
