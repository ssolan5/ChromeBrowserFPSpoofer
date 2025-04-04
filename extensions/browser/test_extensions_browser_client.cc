// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "extensions/browser/test_extensions_browser_client.h"

#include "base/values.h"
#include "build/build_config.h"
#include "content/public/browser/browser_context.h"
#include "extensions/browser/extension_host_delegate.h"
#include "extensions/browser/test_runtime_api_delegate.h"
#include "extensions/browser/updater/null_extension_cache.h"
#include "services/network/public/mojom/url_loader.mojom.h"
#include "ui/base/l10n/l10n_util.h"

#if defined(OS_CHROMEOS)
#include "chromeos/login/login_state/login_state.h"
#endif

using content::BrowserContext;

namespace extensions {

TestExtensionsBrowserClient::TestExtensionsBrowserClient(
    BrowserContext* main_context)
    : main_context_(nullptr),
      incognito_context_(nullptr),
      lock_screen_context_(nullptr),
      process_manager_delegate_(nullptr),
      extension_system_factory_(nullptr),
      extension_cache_(std::make_unique<NullExtensionCache>()) {
  if (main_context)
    SetMainContext(main_context);
}

TestExtensionsBrowserClient::TestExtensionsBrowserClient()
    : TestExtensionsBrowserClient(nullptr) {}

TestExtensionsBrowserClient::~TestExtensionsBrowserClient() {}

void TestExtensionsBrowserClient::SetUpdateClientFactory(
    const base::Callback<update_client::UpdateClient*(void)>& factory) {
  update_client_factory_ = factory;
}

void TestExtensionsBrowserClient::SetMainContext(
    content::BrowserContext* main_context) {
  DCHECK(!main_context_);
  DCHECK(main_context);
  DCHECK(!main_context->IsOffTheRecord());
  main_context_ = main_context;
}

void TestExtensionsBrowserClient::SetIncognitoContext(BrowserContext* context) {
  // If a context is provided it must be off-the-record.
  DCHECK(!context || context->IsOffTheRecord());
  incognito_context_ = context;
}

bool TestExtensionsBrowserClient::IsShuttingDown() { return false; }

bool TestExtensionsBrowserClient::AreExtensionsDisabled(
    const base::CommandLine& command_line,
    BrowserContext* context) {
  return false;
}

bool TestExtensionsBrowserClient::IsValidContext(BrowserContext* context) {
  return context == main_context_ ||
         (incognito_context_ && context == incognito_context_);
}

bool TestExtensionsBrowserClient::IsSameContext(BrowserContext* first,
                                                BrowserContext* second) {
  DCHECK(first);
  DCHECK(second);
  return first == second ||
         (first == main_context_ && second == incognito_context_) ||
         (first == incognito_context_ && second == main_context_);
}

bool TestExtensionsBrowserClient::HasOffTheRecordContext(
    BrowserContext* context) {
  return context == main_context_ && incognito_context_ != nullptr;
}

BrowserContext* TestExtensionsBrowserClient::GetOffTheRecordContext(
    BrowserContext* context) {
  if (context == main_context_)
    return incognito_context_;
  return nullptr;
}

BrowserContext* TestExtensionsBrowserClient::GetOriginalContext(
    BrowserContext* context) {
  return main_context_;
}

#if defined(OS_CHROMEOS)
std::string TestExtensionsBrowserClient::GetUserIdHashFromContext(
    content::BrowserContext* context) {
  if (context != main_context_ || !chromeos::LoginState::IsInitialized())
    return "";
  return chromeos::LoginState::Get()->primary_user_hash();
}
#endif

bool TestExtensionsBrowserClient::IsGuestSession(
    BrowserContext* context) const {
  return false;
}

bool TestExtensionsBrowserClient::IsExtensionIncognitoEnabled(
    const std::string& extension_id,
    content::BrowserContext* context) const {
  return false;
}

bool TestExtensionsBrowserClient::CanExtensionCrossIncognito(
    const extensions::Extension* extension,
    content::BrowserContext* context) const {
  return false;
}

base::FilePath TestExtensionsBrowserClient::GetBundleResourcePath(
    const network::ResourceRequest& request,
    const base::FilePath& extension_resources_path,
    int* resource_id) const {
  *resource_id = 0;
  return base::FilePath();
}

void TestExtensionsBrowserClient::LoadResourceFromResourceBundle(
    const network::ResourceRequest& request,
    network::mojom::URLLoaderRequest loader,
    const base::FilePath& resource_relative_path,
    int resource_id,
    const std::string& content_security_policy,
    network::mojom::URLLoaderClientPtr client,
    bool send_cors_header) {
  // Should not be called because GetBundleResourcePath() returned empty path.
  NOTREACHED() << "Resource is not from a bundle.";
}

bool TestExtensionsBrowserClient::AllowCrossRendererResourceLoad(
    const GURL& url,
    content::ResourceType resource_type,
    ui::PageTransition page_transition,
    int child_id,
    bool is_incognito,
    const Extension* extension,
    const ExtensionSet& extensions,
    const ProcessMap& process_map) {
  return false;
}

PrefService* TestExtensionsBrowserClient::GetPrefServiceForContext(
    BrowserContext* context) {
  return nullptr;
}

void TestExtensionsBrowserClient::GetEarlyExtensionPrefsObservers(
    content::BrowserContext* context,
    std::vector<EarlyExtensionPrefsObserver*>* observers) const {}

ProcessManagerDelegate* TestExtensionsBrowserClient::GetProcessManagerDelegate()
    const {
  return process_manager_delegate_;
}

std::unique_ptr<ExtensionHostDelegate>
TestExtensionsBrowserClient::CreateExtensionHostDelegate() {
  return std::unique_ptr<ExtensionHostDelegate>();
}

bool TestExtensionsBrowserClient::DidVersionUpdate(BrowserContext* context) {
  return false;
}

void TestExtensionsBrowserClient::PermitExternalProtocolHandler() {
}

bool TestExtensionsBrowserClient::IsInDemoMode() {
  return false;
}

bool TestExtensionsBrowserClient::IsScreensaverInDemoMode(
    const std::string& app_id) {
  return false;
}

bool TestExtensionsBrowserClient::IsRunningInForcedAppMode() { return false; }

bool TestExtensionsBrowserClient::IsAppModeForcedForApp(
    const ExtensionId& extension_id) {
  return false;
}

bool TestExtensionsBrowserClient::IsLoggedInAsPublicAccount() {
  return false;
}

ExtensionSystemProvider*
TestExtensionsBrowserClient::GetExtensionSystemFactory() {
  DCHECK(extension_system_factory_);
  return extension_system_factory_;
}

void TestExtensionsBrowserClient::RegisterExtensionInterfaces(
    service_manager::BinderRegistryWithArgs<content::RenderFrameHost*>*
        registry,
    content::RenderFrameHost* render_frame_host,
    const Extension* extension) const {}

std::unique_ptr<RuntimeAPIDelegate>
TestExtensionsBrowserClient::CreateRuntimeAPIDelegate(
    content::BrowserContext* context) const {
  return std::unique_ptr<RuntimeAPIDelegate>(new TestRuntimeAPIDelegate());
}

const ComponentExtensionResourceManager*
TestExtensionsBrowserClient::GetComponentExtensionResourceManager() {
  return nullptr;
}

void TestExtensionsBrowserClient::BroadcastEventToRenderers(
    events::HistogramValue histogram_value,
    const std::string& event_name,
    std::unique_ptr<base::ListValue> args) {}

ExtensionCache* TestExtensionsBrowserClient::GetExtensionCache() {
  return extension_cache_.get();
}

bool TestExtensionsBrowserClient::IsBackgroundUpdateAllowed() {
  return true;
}

bool TestExtensionsBrowserClient::IsMinBrowserVersionSupported(
    const std::string& min_version) {
  return true;
}

ExtensionWebContentsObserver*
TestExtensionsBrowserClient::GetExtensionWebContentsObserver(
    content::WebContents* web_contents) {
  return nullptr;
}

KioskDelegate* TestExtensionsBrowserClient::GetKioskDelegate() {
  return nullptr;
}

scoped_refptr<update_client::UpdateClient>
TestExtensionsBrowserClient::CreateUpdateClient(
    content::BrowserContext* context) {
  return update_client_factory_.is_null()
             ? nullptr
             : base::WrapRefCounted(update_client_factory_.Run());
}

bool TestExtensionsBrowserClient::IsLockScreenContext(
    content::BrowserContext* context) {
  return lock_screen_context_ && context == lock_screen_context_;
}

std::string TestExtensionsBrowserClient::GetApplicationLocale() {
  return l10n_util::GetApplicationLocale(std::string());
}

}  // namespace extensions
